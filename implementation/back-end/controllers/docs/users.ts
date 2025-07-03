import { Request, Response } from "express";
import { body, param } from "express-validator";

import {
  errorInvalidParams,
  result,
  errorCustom,
  CustomErrorMsg,
} from "../../models/responser/response";
import { Doc, Role } from "../../models/docs";
import { User } from "../../models/users";

enum DocUsersListErrorCodes {
  FAILED_TO_GET_DOCS = 10001,
  NO_PERMISSION = 10002,
}

const docUsersListErrorMessages: CustomErrorMsg = {
  [DocUsersListErrorCodes.FAILED_TO_GET_DOCS]: "Failed to get the doc",
  [DocUsersListErrorCodes.NO_PERMISSION]:
    "You have no permission to access this doc",
};

export const docUsersListParams = [
  // docID is a MongoDB ObjectId
  param("docID").isMongoId().withMessage("Invalid docID"),
];

/**
 * Get doc content
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 */
export const docUsersList = async (req: Request, res: Response) => {
  // Check params
  if (await errorInvalidParams(req, res, docUsersListParams)) {
    return;
  }

  // Find doc
  const doc = await Doc.findById(req.params.docID);

  if (!doc) {
    errorCustom(
      DocUsersListErrorCodes.FAILED_TO_GET_DOCS,
      docUsersListErrorMessages,
      res
    );
    return;
  }

  // Check user role in the doc
  if (!doc.users[req?.session?.user?._id]) {
    errorCustom(
      DocUsersListErrorCodes.NO_PERMISSION,
      docUsersListErrorMessages,
      res
    );
    return;
  }

  // Collect users
  const resultUsers = [];
  for (const userID of Object.keys(doc.users)) {
    const user = await User.findById(userID);
    if (user) {
      resultUsers.push({
        _id: user._id,
        username: user.username,
        role: doc.users[userID],
      });
    }
  }

  result(0, "Get doc users successfully", resultUsers, res);
};

enum DocUsersAddErrorCodes {
  FAILED_TO_GET_DOCS = 10001,
  NO_PERMISSION = 10002,
  FAILED_TO_ADD_USER = 10003,
  USER_NOT_EXIST = 10004,
}

const docUsersAddErrorMessages: CustomErrorMsg = {
  [DocUsersListErrorCodes.FAILED_TO_GET_DOCS]: "Failed to get the doc",
  [DocUsersListErrorCodes.NO_PERMISSION]:
    "You have no permission to access this doc",
  [DocUsersAddErrorCodes.FAILED_TO_ADD_USER]: "Failed to add user to the doc",
  [DocUsersAddErrorCodes.USER_NOT_EXIST]: "User does not exist",
};

export const docUsersAddParams = [
  // docID is a MongoDB ObjectId
  param("docID").isMongoId().withMessage("Invalid docID"),

  // userID is a MongoDB ObjectId
  param("userID").isMongoId().withMessage("Invalid userID"),

  // role is a Role enum
  body("role").isIn(Object.values(Role)).withMessage("Invalid role"),
];

/**
 * Add user to doc
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 */
export const docUsersAdd = async (req: Request, res: Response) => {
  // Check params
  if (await errorInvalidParams(req, res, docUsersAddParams)) {
    return;
  }

  // Find doc
  const doc = await Doc.findById(req.params.docID);

  if (!doc) {
    errorCustom(
      DocUsersAddErrorCodes.FAILED_TO_GET_DOCS,
      docUsersAddErrorMessages,
      res
    );
    return;
  }

  // Check user role in the doc
  if (doc.users[req?.session?.user?._id] !== Role.EDITOR) {
    errorCustom(
      DocUsersAddErrorCodes.NO_PERMISSION,
      docUsersAddErrorMessages,
      res
    );
    return;
  }

  // Chech if user exists
  const user = await User.findById(req.params.userID);

  if (!user) {
    errorCustom(
      DocUsersAddErrorCodes.USER_NOT_EXIST,
      docUsersAddErrorMessages,
      res
    );
    return;
  }

  // Add user to the doc
  try {
    await doc.updateOne({
      $set: {
        [`users.${req.params.userID}`]: req.body.role,
      },
    });

    result(0, "Add user to the doc successfully", {}, res);
  } catch (error) {
    errorCustom(
      DocUsersAddErrorCodes.FAILED_TO_ADD_USER,
      docUsersAddErrorMessages,
      res
    );
  }
};

enum DocUsersRemoveErrorCodes {
  FAILED_TO_GET_DOCS = 10001,
  NO_PERMISSION = 10002,
  CANNOT_REMOVE_SELF = 10003,
  USER_NOT_EXIST = 10004,
  FAILED_TO_REMOVE_USER = 10005,
}

const docUsersRemoveErrorMessages: CustomErrorMsg = {
  [DocUsersListErrorCodes.FAILED_TO_GET_DOCS]: "Failed to get the doc",
  [DocUsersListErrorCodes.NO_PERMISSION]:
    "You have no permission to access this doc",
  [DocUsersRemoveErrorCodes.CANNOT_REMOVE_SELF]:
    "Cannot remove yourself from the doc",
  [DocUsersRemoveErrorCodes.USER_NOT_EXIST]: "User does not exist in the doc",
  [DocUsersRemoveErrorCodes.FAILED_TO_REMOVE_USER]:
    "Failed to remove user from the doc",
};

export const docUsersRemoveParams = [
  // docID is a MongoDB ObjectId
  param("docID").isMongoId().withMessage("Invalid docID"),

  // userID is a MongoDB ObjectId
  param("userID").isMongoId().withMessage("Invalid userID"),
];

/**
 * Remove user from doc
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 */
export const docUsersRemove = async (req: Request, res: Response) => {
  // Check params
  if (await errorInvalidParams(req, res, docUsersRemoveParams)) {
    return;
  }

  // Find doc
  const doc = await Doc.findById(req.params.docID);

  if (!doc) {
    errorCustom(
      DocUsersRemoveErrorCodes.FAILED_TO_GET_DOCS,
      docUsersRemoveErrorMessages,
      res
    );
    return;
  }

  // Check user role in the doc
  if (doc.users[req?.session?.user?._id] !== Role.EDITOR) {
    errorCustom(
      DocUsersRemoveErrorCodes.NO_PERMISSION,
      docUsersRemoveErrorMessages,
      res
    );
    return;
  }

  // Check if the user is removing themselves
  if (req.params.userID === req?.session?.user?._id) {
    errorCustom(
      DocUsersRemoveErrorCodes.CANNOT_REMOVE_SELF,
      docUsersRemoveErrorMessages,
      res
    );
    return;
  }

  // Check if the user exists in the doc
  if (!doc.users[req.params.userID]) {
    errorCustom(
      DocUsersRemoveErrorCodes.USER_NOT_EXIST,
      docUsersRemoveErrorMessages,
      res
    );
    return;
  }

  // Remove user from the doc
  try {
    await doc.updateOne({
      $unset: {
        [`users.${req.params.userID}`]: 1,
      },
    });

    result(0, "Remove user from the doc successfully", {}, res);
  } catch (error) {
    errorCustom(
      DocUsersRemoveErrorCodes.FAILED_TO_REMOVE_USER,
      docUsersRemoveErrorMessages,
      res
    );
  }
};

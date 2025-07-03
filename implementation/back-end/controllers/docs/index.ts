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

enum DocGetErrorCodes {
  FAILED_TO_GET_DOCS = 10001,
  NO_PERMISSION = 10002,
}

const docGetErrorMessages: CustomErrorMsg = {
  [DocGetErrorCodes.FAILED_TO_GET_DOCS]: "Failed to get the doc",
  [DocGetErrorCodes.NO_PERMISSION]: "You have no permission to access this doc",
};

export const docGetParams = [
  // docID is a MongoDB ObjectId
  param("docID").isMongoId().withMessage("Invalid docID"),
];

/**
 * Get doc content
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 */
export const docGet = async (req: Request, res: Response) => {
  // Check params
  if (await errorInvalidParams(req, res, docGetParams)) {
    return;
  }

  // Find doc
  const doc = await Doc.findById(req.params.docID);

  if (!doc) {
    errorCustom(DocGetErrorCodes.FAILED_TO_GET_DOCS, docGetErrorMessages, res);
    return;
  }

  // Add user to the doc
  if (!doc.users[req?.session?.user?._id]) {
    await Doc.updateOne(
      { _id: req.params.docID },
      {
        $set: {
          [`users.${req?.session?.user?._id}`]: Role.EDITOR,
        },
      }
    ).exec();
    doc.users[req?.session?.user?._id] = Role.EDITOR;
  }

  // Check user role in the doc
  if (!doc.users[req?.session?.user?._id]) {
    errorCustom(DocGetErrorCodes.NO_PERMISSION, docGetErrorMessages, res);
    return;
  }

  // Collect online users
  const onlineUsers = [];
  for (const userID of Object.keys(doc.onlineUsers)) {
    const user = await User.findById(userID);
    if (user) {
      onlineUsers.push({
        _id: user._id,
        username: user.username,
        focus: doc.onlineUsers[userID].focus,
      });
    }
  }

  result(
    0,
    "Get doc successfully",
    {
      doc: {
        _id: doc._id,
        name: doc.name,
        cells: doc.cells.map((row) =>
          row.map((cell) => ({
            type: cell.type,
            value: cell.value,
            meta: cell.meta || {},
          }))
        ),
        createdTime: doc.createdTime,
        updatedTime: doc.updatedTime,
      },
      role: doc.users[req?.session?.user?._id],
      onlineUsers,
    },
    res
  );
};

enum DocCreateErrorCodes {
  FAILED_TO_CREATE_DOC = 10001,
}

const docCreateErrorMessages: CustomErrorMsg = {
  [DocCreateErrorCodes.FAILED_TO_CREATE_DOC]: "Failed to create the doc",
};

export const docCreateParams = [
  // name is required
  body("name").notEmpty().withMessage("Name is required"),
];

/**
 * Create doc
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 */
export const docCreate = async (req: Request, res: Response) => {
  // Check params
  if (await errorInvalidParams(req, res, docCreateParams)) {
    return;
  }

  // Create doc
  const doc = new Doc({
    name: req.body.name,
    cells: [
      [
        {
          type: "STRING",
          value: "",
          meta: {},
        },
      ],
    ],
    users: {
      [req?.session?.user?._id]: "EDITOR",
    },
    onlineUsers: [],
    versionCount: 0,
    createdTime: Math.floor(Date.now() / 1000),
    updatedTime: Math.floor(Date.now() / 1000),
  });

  try {
    await doc.save();
  } catch (error) {
    errorCustom(
      DocCreateErrorCodes.FAILED_TO_CREATE_DOC,
      docCreateErrorMessages,
      res
    );
    return;
  }

  result(
    0,
    "Create doc success",
    {
      _id: doc._id,
    },
    res
  );
};

enum DocDeleteErrorCodes {
  DOC_NOT_FOUND = 10001,
  NO_PERMISSION = 10002,
  FAILED_TO_DELETE_DOC = 10003,
}

const docDeleteErrorMessages: CustomErrorMsg = {
  [DocDeleteErrorCodes.DOC_NOT_FOUND]: "Doc not found",
  [DocDeleteErrorCodes.NO_PERMISSION]:
    "You have no permission to delete the doc",
  [DocDeleteErrorCodes.FAILED_TO_DELETE_DOC]: "Failed to delete the doc",
};

export const docDeleteParams = [
  // docID is a MongoDB ObjectId
  param("docID").isMongoId().withMessage("Invalid docID"),
];

/**
 * Delete a doc
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 */
export const docDelete = async (req: Request, res: Response) => {
  // Check params
  if (await errorInvalidParams(req, res, docDeleteParams)) {
    return;
  }

  // Find doc
  const doc = await Doc.findById(req.params.docID);

  if (!doc) {
    errorCustom(DocDeleteErrorCodes.DOC_NOT_FOUND, docDeleteErrorMessages, res);
    return;
  }

  // Check user role in the doc
  if (doc.users[req?.session?.user?._id] !== Role.EDITOR) {
    errorCustom(DocDeleteErrorCodes.NO_PERMISSION, docDeleteErrorMessages, res);
    return;
  }

  // Delete doc
  await doc.deleteOne().catch(() => {
    errorCustom(
      DocDeleteErrorCodes.FAILED_TO_DELETE_DOC,
      docDeleteErrorMessages,
      res
    );
  });

  result(0, "Delete doc success", {}, res);
};

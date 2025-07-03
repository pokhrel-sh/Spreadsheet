import { Request, Response } from "express";
import { body, param } from "express-validator";

import {
  errorInvalidParams,
  result,
  errorCustom,
  CustomErrorMsg,
} from "../../../models/responser/response";
import { Doc, DocHistoryVersion, Role } from "../../../models/docs";
import { User } from "../../../models/users";

enum DocHistoryGetErrorCodes {
  FAILED_TO_GET_HISTORY = 10001,
  FAILED_TO_GET_DOCS = 10002,
  NO_PERMISSION = 10003,
}

const docHistoryGetErrorMessages: CustomErrorMsg = {
  [DocHistoryGetErrorCodes.FAILED_TO_GET_HISTORY]: "Failed to get history",
  [DocHistoryGetErrorCodes.FAILED_TO_GET_DOCS]: "Failed to get the doc",
  [DocHistoryGetErrorCodes.NO_PERMISSION]:
    "You have no permission to access this doc",
};

export const docHistoryGetParams = [
  // versionID is a MongoDB ObjectId
  param("versionID").isMongoId().withMessage("Invalid versionID"),
];

/**
 * Get doc history version
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 */
export const docHistoryGet = async (req: Request, res: Response) => {
  // Check params
  if (await errorInvalidParams(req, res, docHistoryGetParams)) {
    return;
  }

  // Find history version
  const historyVersion = await DocHistoryVersion.findById(
    req?.params?.versionID
  );

  if (!historyVersion) {
    errorCustom(
      DocHistoryGetErrorCodes.FAILED_TO_GET_HISTORY,
      docHistoryGetErrorMessages,
      res
    );
    return;
  }

  // Find doc
  const doc = await Doc.findById(historyVersion?.docID);

  if (!doc) {
    errorCustom(
      DocHistoryGetErrorCodes.FAILED_TO_GET_DOCS,
      docHistoryGetErrorMessages,
      res
    );
    return;
  }

  // Check user role in the doc
  if (!doc.users[req?.session?.user?._id]) {
    errorCustom(
      DocHistoryGetErrorCodes.NO_PERMISSION,
      docHistoryGetErrorMessages,
      res
    );
    return;
  }

  const createdUser = await User.findById(historyVersion?.createdUser);

  result(
    0,
    "Get doc history successfully",
    {
      _id: historyVersion?._id,
      docID: historyVersion?.docID,
      versionNumber: historyVersion?.versionNumber,
      description: historyVersion?.description,
      cells: historyVersion?.cells,
      createdUser: {
        _id: createdUser?._id,
        username: createdUser?.username,
      },
      createdTime: historyVersion?.createdTime,
    },
    res
  );
};

enum DocHistoryCreateErrorCodes {
  FAILED_TO_GET_DOCS = 10001,
  NO_PERMISSION = 10002,
  FAILED_TO_CREATE_HISTORY_VERSION = 10003,
}

const docHistoryCreateErrorMessages: CustomErrorMsg = {
  [DocHistoryCreateErrorCodes.FAILED_TO_GET_DOCS]: "Failed to get the doc",
  [DocHistoryCreateErrorCodes.NO_PERMISSION]:
    "You have no permission to access this doc",
  [DocHistoryCreateErrorCodes.FAILED_TO_CREATE_HISTORY_VERSION]:
    "Failed to create history version",
};

export const docHistoryCreateParams = [
  // docID is a MongoDB ObjectId
  param("docID").isMongoId().withMessage("Invalid docID"),

  // description is a string
  body("description").isString().withMessage("Invalid description"),
];

/**
 * Create doc history version
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 */
export const docHistoryCreate = async (req: Request, res: Response) => {
  // Check params
  if (await errorInvalidParams(req, res, docHistoryCreateParams)) {
    return;
  }

  // Find doc
  const doc = await Doc.findById(req?.params?.docID);

  if (!doc) {
    errorCustom(
      DocHistoryCreateErrorCodes.FAILED_TO_GET_DOCS,
      docHistoryCreateErrorMessages,
      res
    );
    return;
  }

  // Check user role in the doc
  if (doc.users[req?.session?.user?._id] !== Role.EDITOR) {
    errorCustom(
      DocHistoryCreateErrorCodes.NO_PERMISSION,
      docHistoryCreateErrorMessages,
      res
    );
    return;
  }

  // Create transaction
  const session = await Doc.startSession();
  session.startTransaction();

  try {
    // Increase version count
    doc.versionCount += 1;
    await doc.save({ session });

    const newHistoryVersion = new DocHistoryVersion({
      docID: doc._id,
      versionNumber: doc.versionCount,
      description: req?.body?.description,
      cells: doc.cells,
      createdUser: req?.session?.user?._id,
      createdTime: Math.floor(Date.now() / 1000),
    });

    await newHistoryVersion.save({ session });

    // Commit transaction
    await session.commitTransaction();

    session.endSession();

    result(
      0,
      "Create doc history version successfully",
      {
        _id: newHistoryVersion._id,
      },
      res
    );
  } catch (error) {
    // Rollback transaction
    await session.abortTransaction();
    session.endSession();

    errorCustom(
      DocHistoryCreateErrorCodes.FAILED_TO_CREATE_HISTORY_VERSION,
      docHistoryCreateErrorMessages,
      res
    );
  }
};

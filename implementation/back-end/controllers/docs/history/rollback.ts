import { Request, Response } from "express";
import { param } from "express-validator";

import {
  errorInvalidParams,
  result,
  errorCustom,
  CustomErrorMsg,
} from "../../../models/responser/response";
import { Doc, DocHistoryVersion, Role } from "../../../models/docs";

enum DocHistoryRollbackErrorCodes {
  FAILED_TO_GET_HISTORY = 10001,
  FAILED_TO_GET_DOCS = 10002,
  NO_PERMISSION = 10003,
  FAILED_TO_CREATE_HISTORY_VERSION = 10004,
  FAILED_TO_ROLLBACK = 10005,
}

const docHistoryRollbackErrorMessages: CustomErrorMsg = {
  [DocHistoryRollbackErrorCodes.FAILED_TO_GET_DOCS]: "Failed to get the doc",
  [DocHistoryRollbackErrorCodes.NO_PERMISSION]:
    "You have no permission to access this doc",
  [DocHistoryRollbackErrorCodes.FAILED_TO_GET_HISTORY]: "Failed to get history",
  [DocHistoryRollbackErrorCodes.FAILED_TO_CREATE_HISTORY_VERSION]:
    "Failed to create history version",
  [DocHistoryRollbackErrorCodes.FAILED_TO_ROLLBACK]: "Failed to rollback",
};

export const docHistoryRollbackParams = [
  // id is a MongoDB ObjectId
  param("id").isMongoId().withMessage("Invalid id"),
];

/**
 * Rollback doc history version
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 */
export const docHistoryRollback = async (req: Request, res: Response) => {
  // Check params
  if (await errorInvalidParams(req, res, docHistoryRollbackParams)) {
    return;
  }

  // Find history version
  const historyVersion = await DocHistoryVersion.findById(req?.params?.id);

  if (!historyVersion) {
    errorCustom(
      DocHistoryRollbackErrorCodes.FAILED_TO_GET_HISTORY,
      docHistoryRollbackErrorMessages,
      res
    );
    return;
  }

  // Find doc
  const doc = await Doc.findById(historyVersion?.docID);

  if (!doc) {
    errorCustom(
      DocHistoryRollbackErrorCodes.FAILED_TO_GET_DOCS,
      docHistoryRollbackErrorMessages,
      res
    );
    return;
  }

  // Check user role in the doc
  if (doc.users[req?.session?.user?._id] !== Role.EDITOR) {
    errorCustom(
      DocHistoryRollbackErrorCodes.NO_PERMISSION,
      docHistoryRollbackErrorMessages,
      res
    );
    return;
  }

  // Create transaction
  const session = await Doc.startSession();
  session.startTransaction();

  try {
    const backupedCells = doc.cells;

    doc.versionCount += 1;
    doc.cells = historyVersion.cells;

    await doc.save({ session });

    const newHistoryVersion = new DocHistoryVersion({
      docID: doc._id,
      versionNumber: doc.versionCount,
      description:
        "Backup before rollback to version " + historyVersion.versionNumber,
      cells: backupedCells,
      createdUser: req?.session?.user?._id,
      createdTime: Math.floor(Date.now() / 1000),
    });

    await newHistoryVersion.save({ session });

    await session.commitTransaction();
    session.endSession();

    result(0, "Rollback doc history version successfully", {}, res);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    errorCustom(
      DocHistoryRollbackErrorCodes.FAILED_TO_CREATE_HISTORY_VERSION,
      docHistoryRollbackErrorMessages,
      res
    );
  }
};

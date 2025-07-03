import { Request, Response } from "express";
import { param, query } from "express-validator";

import {
  errorInvalidParams,
  result,
  errorCustom,
  CustomErrorMsg,
} from "../../../models/responser/response";
import { Doc, DocHistoryVersion } from "../../../models/docs";
import { User } from "../../../models/users";

enum DocHistoryListErrorCodes {
  FAILED_TO_GET_DOCS = 10001,
  NO_PERMISSION = 10002,
  FAILED_TO_GET_HISTORIES = 10003,
}

const docHistoryListErrorMessages: CustomErrorMsg = {
  [DocHistoryListErrorCodes.FAILED_TO_GET_DOCS]: "Failed to get the doc",
  [DocHistoryListErrorCodes.NO_PERMISSION]:
    "You have no permission to access this doc",
  [DocHistoryListErrorCodes.FAILED_TO_GET_HISTORIES]: "Failed to get history",
};

export const docHistoryListParams = [
  // docID is a MongoDB ObjectId
  param("docID").isMongoId().withMessage("Invalid docID"),

  // limit is a positive number
  query("limit").isInt({ min: 1 }).withMessage("Invalid limit"),

  // offsetID is a MongoDB ObjectId, optional
  query("offsetID").optional().isMongoId().withMessage("Invalid offsetID"),
];

/**
 * List doc history versions
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 */
export const docHistoryList = async (req: Request, res: Response) => {
  // Check params
  if (await errorInvalidParams(req, res, docHistoryListParams)) {
    return;
  }

  // Find doc
  const doc = await Doc.findById(req.params.docID);

  if (!doc) {
    errorCustom(
      DocHistoryListErrorCodes.FAILED_TO_GET_DOCS,
      docHistoryListErrorMessages,
      res
    );
    return;
  }

  // Check user role in the doc
  if (!doc.users[req?.session?.user?._id]) {
    errorCustom(
      DocHistoryListErrorCodes.NO_PERMISSION,
      docHistoryListErrorMessages,
      res
    );
    return;
  }

  // Query history versions
  const q: { docID: string; _id?: { $gt: string } } = {
    docID: req.params.docID,
  };
  if (req.query.offsetID) {
    q._id = { $gt: req.query.offsetID as string };
  }

  const histories = await DocHistoryVersion.find(q)
    .sort({ _id: -1 })
    .limit(parseInt(req.query.limit as string));

  if (!histories) {
    errorCustom(
      DocHistoryListErrorCodes.FAILED_TO_GET_HISTORIES,
      docHistoryListErrorMessages,
      res
    );
    return;
  }

  const resultHistories = [];
  for (const history of histories) {
    const createdUser = await User.findById(history.createdUser);

    resultHistories.push({
      _id: history._id,
      versionNumber: history.versionNumber,
      description: history.description,
      createdUser: {
        _id: createdUser?._id,
        username: createdUser?.username,
      },
      createdTime: history.createdTime,
    });
  }

  result(0, "Get doc history list successfully", resultHistories, res);
};

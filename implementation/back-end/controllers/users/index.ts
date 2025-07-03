import { Request, Response } from "express";
import { query } from "express-validator";

import {
  errorInvalidParams,
  result,
  errorCustom,
  CustomErrorMsg,
} from "../../models/responser/response";
import { User } from "../../models/users";

enum UserSearchErrorCodes {
  FAILED_TO_SEARCH_USERS = 10001,
}

const userSearchErrorMessages: CustomErrorMsg = {
  [UserSearchErrorCodes.FAILED_TO_SEARCH_USERS]: "Failed to search users",
};

export const userSearchParams = [
  // docID is a MongoDB ObjectId
  query("keyword").isString().withMessage("Keyword is required"),
];

/**
 * Search users
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 */
export const userSearch = async (req: Request, res: Response) => {
  // Check params
  if (await errorInvalidParams(req, res, userSearchParams)) {
    return;
  }

  // Find users
  // 模糊搜索username
  const users = await User.find({
    username: { $regex: req.query.keyword, $options: "i" },
  });

  if (!users) {
    errorCustom(
      UserSearchErrorCodes.FAILED_TO_SEARCH_USERS,
      userSearchErrorMessages,
      res
    );
    return;
  }

  const resultUsers = users.map((user) => {
    return {
      _id: user._id,
      username: user.username,
    };
  });

  result(0, "Search users successfully", resultUsers, res);
};

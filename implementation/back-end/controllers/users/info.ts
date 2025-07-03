import { Request, Response } from "express";

import { result } from "../../models/responser/response";

/**
 * Get user info
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 */
export const userInfo = async (req: Request, res: Response) => {
  // Get user info
  const user = req.session.user;

  // Return result
  result(
    0,
    "Get user info success",
    {
      _id: user?._id,
      username: user?.username,
    },
    res
  );
};

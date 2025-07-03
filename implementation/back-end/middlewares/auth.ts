import { Request, Response, NextFunction } from "express";

import { ErrorCode } from "../models/responser/error_code";
import { errorCommon } from "../models/responser/response";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.session.user) {
    // Logged in
    next();
  } else {
    // Not logged in
    errorCommon(ErrorCode.Unauthorized, res);
  }
};

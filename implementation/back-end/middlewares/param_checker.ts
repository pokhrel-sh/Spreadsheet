import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

import { ErrorCode } from "../models/responser/error_code";

export const paramCheckerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    next();
  } else {
    const errMsg =
      errors
        .array()
        .map((err) => err.msg)
        .join(", ") || "Unknown error";
    res.status(200).json({
      code: ErrorCode.InvalidParams,
      msg: `Parameter error: ${errMsg}`,
    });
  }
};

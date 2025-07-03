/* eslint-disable @typescript-eslint/no-explicit-any */

import { ValidationChain, validationResult } from "express-validator";
import { Response } from "express";
import { ErrorCode, errorMsg } from "./error_code";

/**
 * Response data interface
 */
interface ResponseData {
  code: number;
  msg: string;
  data?: any;
  page?: any;
}

/**
 * Page data interface
 */
interface PageData {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

/**
 * Custom error message dictionary interface
 * (for errorCustom())
 */
export interface CustomErrorMsg {
  [key: number]: string;
}

/**
 * Returns the result
 * @param code Result code
 * @param msg Result message
 * @param data Result data
 * @param res Response object
 */
export const result = (
  code: ErrorCode,
  msg: string,
  data: any,
  res: Response
): void => {
  const response: ResponseData = {
    code: code,
    msg: msg,
    data: data,
  };
  res.status(200).json(response);
};

/**
 * Returns the result with page
 * @param code Result code
 * @param msg Result message
 * @param data Result data
 * @param page Page information
 * @param res Response object
 */
export const resultWithPage = (
  code: ErrorCode,
  msg: string,
  data: any,
  page: PageData,
  res: Response
): void => {
  const response: ResponseData = {
    code: code,
    msg: msg,
    data: data,
    page: page,
  };
  res.status(200).json(response);
};

/**
 * Returns with invalid parameters error
 * @param req Request object
 * @param res Response object
 * @param params Parameters to check
 * @returns Boolean if there is an error
 */
export const errorInvalidParams = async (
  req: any,
  res: Response,
  params: ValidationChain[]
): Promise<boolean> => {
  // Check params
  for (const param of params) {
    await param.run(req);
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errMsg =
      errors
        .array()
        .map((err) => err.msg)
        .join(", ") || "Unknown error";
    res.status(200).json({
      code: ErrorCode.InvalidParams,
      msg: `Parameter error: ${errMsg}`,
    });
    return true;
  }

  return false;
};

/**
 * Returns with common error
 * @param code Error code
 * @param res Response object
 */
export const errorCommon = (code: ErrorCode, res: Response): void => {
  let statusCode = 200;

  // Set status code for specific error code
  if (code === ErrorCode.NotFound) {
    statusCode = 404;
  } else if (code === ErrorCode.Unauthorized) {
    statusCode = 401;
  }

  const response: ResponseData = {
    code: code,
    msg: errorMsg[code],
  };

  res.status(statusCode).json(response);
};

/**
 * Returns with custom error
 * @param code Error code
 * @param errorMsg Custom error message dictionary for each code
 * @param res Response object
 */
export const errorCustom = (
  code: number,
  errorMsgDict: CustomErrorMsg,
  res: Response
): void => {
  res.status(200).json({
    code: code,
    msg: errorMsgDict[code],
  });
};

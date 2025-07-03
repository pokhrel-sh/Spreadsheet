import { Request, Response } from "express";
import { result } from "../models/responser/response";
import { ErrorCode } from "../models/responser/error_code";

export const helloworld = async (req: Request, res: Response) => {
  result(ErrorCode.Success, "Hello World", null, res);
};

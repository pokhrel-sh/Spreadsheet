import { Request, Response } from "express";

import {
  CustomErrorMsg,
  errorCustom,
  result,
} from "../../models/responser/response";

enum UserLogoutErrorCodes {
  FAILED_TO_LOGOUT = 10001,
  AN_ERROR_OCCURRED_DURING_LOGOUT = 10002,
}

const userLogoutErrorMessages: CustomErrorMsg = {
  [UserLogoutErrorCodes.FAILED_TO_LOGOUT]: "Failed to logout",
  [UserLogoutErrorCodes.AN_ERROR_OCCURRED_DURING_LOGOUT]:
    "An error occurred during logout",
};

/**
 * User logout
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 */
export const userLogout = async (req: Request, res: Response) => {
  try {
    req.session.destroy((err) => {
      // Check error
      if (err) {
        errorCustom(
          UserLogoutErrorCodes.FAILED_TO_LOGOUT,
          userLogoutErrorMessages,
          res
        );
      }

      res.clearCookie("connect.sid");
      result(0, "Logout success", null, res);
    });
  } catch (error) {
    errorCustom(
      UserLogoutErrorCodes.AN_ERROR_OCCURRED_DURING_LOGOUT,
      userLogoutErrorMessages,
      res
    );
  }
};

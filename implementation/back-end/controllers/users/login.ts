import { Request, Response } from "express";
import { body } from "express-validator";

import {
  errorInvalidParams,
  result,
  errorCustom,
  CustomErrorMsg,
} from "../../models/responser/response";
import { User } from "../../models/users";
import { comparePassword, hashPassword } from "../../utils/user_passwd";

export enum UserLoginErrorCodes {
  WRONG_USERNAME_OR_PASSWORD = 10001,
  FAILED_TO_REGISTER = 10002,
}

export const userLoginErrorMessages: CustomErrorMsg = {
  [UserLoginErrorCodes.WRONG_USERNAME_OR_PASSWORD]:
    "Wrong username or password",
  [UserLoginErrorCodes.FAILED_TO_REGISTER]: "Failed to register",
};

export const userLoginParams = [
  // username must be a string and at least 4 characters long
  body("username")
    .isLength({ min: 4 })
    .withMessage("Username must be at least 4 characters long"),

  // password must be a string and at least 6 characters long
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

/**
 * User login
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 */
export const userLogin = async (req: Request, res: Response) => {
  // Check params
  if (await errorInvalidParams(req, res, userLoginParams)) {
    return;
  }

  // Find user
  const user = await User.findOne({ username: req.body.username });

  if (user) {
    // Check password
    if (await comparePassword(req.body.password, user.password)) {
      // Set session
      req.session.user = user;

      // Return result
      result(0, "Login success", null, res);
    } else {
      // Password is wrong
      errorCustom(
        UserLoginErrorCodes.WRONG_USERNAME_OR_PASSWORD,
        userLoginErrorMessages,
        res
      );
    }
  } else {
    // Create user
    const newUser = new User({
      username: req.body.username,
      password: await hashPassword(req.body.password),
    });

    // Save the user
    try {
      await newUser.save();

      // Set session
      req.session.user = newUser;

      // Return result
      result(0, "Login success", null, res);
    } catch (err) {
      errorCustom(
        UserLoginErrorCodes.FAILED_TO_REGISTER,
        userLoginErrorMessages,
        res
      );
      return;
    }
  }
};

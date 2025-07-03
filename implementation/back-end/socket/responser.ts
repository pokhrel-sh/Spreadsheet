import { Server, Socket } from "socket.io";
import { CustomErrorMsg } from "../models/responser/response";

enum ErrorType {
  // Common errors
  NO_SPECIFIED_USER_ID = 1001,
  INVALID_USER_ID = 1002,
  INVALID_MESSAGE_TYPE = 1003,
  PARAM_MISSING = 1004,
  PARAM_INVALID = 1005,
  NO_PERMISSION_TO_VIEW_DOC = 1006,
  NO_PERMISSION_TO_EDIT_DOC = 1007,

  INTERNAL_SERVER_ERROR = 9999,

  // Custom errors
  DOC_NOT_FOUND = 10001,
  USER_ALREADY_WORKING_ON_DOC = 10002,
  USER_NOT_WORKING_ON_DOC = 10003,
  INVALID_POSITION = 10004,
}

const errorMessages: CustomErrorMsg = {
  [ErrorType.NO_SPECIFIED_USER_ID]: "No specified user ID",
  [ErrorType.INVALID_USER_ID]: "Invalid user ID",
  [ErrorType.INVALID_MESSAGE_TYPE]: "Invalid message type",
  [ErrorType.PARAM_MISSING]: "Parameter missing",
  [ErrorType.PARAM_INVALID]: "Parameter invalid",
};

/**
 * Send error message to client
 * @param errorType error type
 * @param io socket server instance
 * @param socket socket connection
 */
const sendError = (errorType: ErrorType, io: Server, socket: Socket) => {
  io.to(socket.id).emit("message", {
    type: "error",
    data: {
      code: errorType,
      message: errorMessages[errorType],
    },
  });
};

export default {
  ErrorType,
  sendError,
};

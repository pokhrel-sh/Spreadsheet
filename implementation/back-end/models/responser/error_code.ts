export enum ErrorCode {
  Success = 0,
  NotFound = 1001,
  Unauthorized = 1002,
  InvalidParams = 1003,
  UnknownError = 9999,
}

export const errorMsg: { [key: number]: string } = {
  [ErrorCode.Success]: "Success",
  [ErrorCode.NotFound]: "Not Found",
  [ErrorCode.Unauthorized]: "Login Required",
  [ErrorCode.InvalidParams]: "Invalid Parameters",
  [ErrorCode.UnknownError]: "Unknown Error",
};

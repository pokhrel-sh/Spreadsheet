import mongoose from "mongoose";
import { Server, Socket } from "socket.io";

import handler from "./handler";
import { MessageType, UserInfo } from "./message_types";
import responser from "./responser";
import { User } from "../models/users";
import { Doc } from "../models/docs";

/**
 * Handle messages
 * @param io socket server instance
 * @param socket socket connection
 * @param message received message
 * @returns void
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleMessages = (io: Server, socket: Socket, message: any) => {
  try {
    const userInfo = socket.data?.userInfo;
    // io.to(socket.id).emit("message", message);

    // parse message
    const { type, data } = message;

    // handle message
    switch (type) {
      case MessageType.JOIN:
        // handle join message
        const joinedDocID = data?.docID;

        // check if docID exists
        if (!joinedDocID) {
          responser.sendError(responser.ErrorType.PARAM_MISSING, io, socket);
          return;
        }

        handler.handleJoinMessage(io, socket, userInfo, joinedDocID);
        break;

      case MessageType.EXIT:
        // handle exit message
        const exitedDocID = data?.docID;

        // check if docID exists
        if (!exitedDocID) {
          responser.sendError(responser.ErrorType.PARAM_MISSING, io, socket);
          return;
        }

        handler.handleExitMessage(io, socket, userInfo, exitedDocID);
        break;

      case MessageType.FOCUS:
        // handle focus message
        const focuedPosition = data?.position;

        // check if position exists
        if (!focuedPosition) {
          responser.sendError(responser.ErrorType.PARAM_MISSING, io, socket);
          return;
        }

        handler.handleFocusMessage(io, socket, userInfo, focuedPosition);
        break;

      case MessageType.UPDATE:
        // handle update message
        const updatedCells = data?.cells;

        // check if cells exists
        if (!updatedCells) {
          responser.sendError(responser.ErrorType.PARAM_MISSING, io, socket);
          return;
        }

        handler.handleUpdateMessage(io, socket, userInfo, updatedCells);
        break;

      default:
        responser.sendError(
          responser.ErrorType.INVALID_MESSAGE_TYPE,
          io,
          socket
        );
        break;
    }
  } catch (error) {
    console.error(error);
    responser.sendError(responser.ErrorType.INTERNAL_SERVER_ERROR, io, socket);
  }
};

/**
 * Handle disconnection
 * @param socket socket connection
 */
const handleDisconnection = async (socket: Socket) => {
  console.log("A user disconnected");

  // remove user from working docs
  const workingDocID = socket.data?.workingDoc;
  if (workingDocID) {
    // remove user from doc
    try {
      await Doc.updateOne(
        { _id: workingDocID },
        {
          $unset: {
            [`onlineUsers.${socket.data.userInfo.id}`]: "",
          },
        }
      ).exec();
    } catch (error) {
      console.error(error);
    }
  }
};

/**
 * Handle connection
 * @param io socket server instance
 * @param socket socket connection
 * @returns void
 */
const handleConnection = async (io: Server, socket: Socket) => {
  // check user id in query
  const userID = socket.handshake.query.userID as string;

  // disconnect if no user id
  if (!userID) {
    responser.sendError(responser.ErrorType.NO_SPECIFIED_USER_ID, io, socket);
    socket.disconnect();
    return;
  }

  // check if user id is ObjectId
  if (!mongoose.Types.ObjectId.isValid(userID)) {
    responser.sendError(responser.ErrorType.INVALID_USER_ID, io, socket);
    socket.disconnect();
    return;
  }

  // check if user exists
  const user = await User.findById(userID);
  if (!user) {
    responser.sendError(responser.ErrorType.INVALID_USER_ID, io, socket);
    socket.disconnect();
    return;
  }

  // register disconnect event
  socket.on("disconnect", () => {
    handleDisconnection(socket);
  });

  // register message event
  socket.on("message", (message) => {
    handleMessages(io, socket, message);
  });

  // save user id to socket
  socket.data.userInfo = {
    id: userID,
    name: user.username,
  } as UserInfo;

  // init user working docs
  socket.data.workingDoc = null;

  // send connected message
  socket.emit("message", { type: "CONNECTED" });
};

/**
 * Register socket handler
 * @param io socket server instance
 */
export const registerHandler = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("A user connected");
    handleConnection(io, socket);
  });
};

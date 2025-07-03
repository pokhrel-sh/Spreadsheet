import mongoose from "mongoose";
import { Server, Socket } from "socket.io";

import responser from "./responser";
import { CellType, Doc } from "../models/docs";
import { Cell, MessageType, Position, UserInfo } from "./message_types";

/**
 * Handle join message
 * @param io socket server instance
 * @param socket connection socket
 * @param userInfo user info
 * @param docID doc ID to join
 * @returns void
 */
const handleJoinMessage = async (
  io: Server,
  socket: Socket,
  userInfo: UserInfo,
  docID: string
) => {
  // check if user is still working on another doc
  const workingDocID = socket.data?.workingDoc;
  if (workingDocID) {
    responser.sendError(
      responser.ErrorType.USER_ALREADY_WORKING_ON_DOC,
      io,
      socket
    );
    return;
  }

  // check if docID is an ObjectID
  if (!mongoose.Types.ObjectId.isValid(docID)) {
    responser.sendError(responser.ErrorType.PARAM_INVALID, io, socket);
    return;
  }

  const doc = await Doc.findById(docID);

  // check if doc exists
  if (!doc) {
    responser.sendError(responser.ErrorType.DOC_NOT_FOUND, io, socket);
    return;
  }

  // check if the user has permission to join the doc
  if (!doc.users[userInfo.id]) {
    responser.sendError(
      responser.ErrorType.NO_PERMISSION_TO_VIEW_DOC,
      io,
      socket
    );
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  // add user to doc
  try {
    await Doc.updateOne(
      { _id: docID },
      {
        $set: {
          onlineUsers: {
            ...doc.onlineUsers,
            [userInfo.id]: {
              focus: ["A", 0],
              socketID: socket.id,
            },
          },
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }

  // save working doc to socket
  socket.data.workingDoc = docID;

  // send broadcast to all users in doc
  Object.keys(doc.onlineUsers).forEach((user) => {
    if (user !== userInfo.id) {
      const socketID = doc.onlineUsers[user].socketID;
      io.to(socketID).emit("message", {
        type: MessageType.JOINED,
        data: {
          user: {
            id: userInfo.id,
            name: userInfo.name,
          },
        },
      });
    }
  });
};

/**
 * Handle exit message
 * @param io socket server instance
 * @param socket connection socket
 * @param userInfo user info
 * @param docID doc ID to exit
 * @returns void
 */
const handleExitMessage = async (
  io: Server,
  socket: Socket,
  userInfo: UserInfo,
  docID: string
) => {
  // check if user is working on the doc
  const workingDocID = socket.data?.workingDoc;
  if (!workingDocID) {
    responser.sendError(
      responser.ErrorType.USER_NOT_WORKING_ON_DOC,
      io,
      socket
    );
    return;
  }

  // check if docID is an ObjectID
  if (!mongoose.Types.ObjectId.isValid(docID)) {
    responser.sendError(responser.ErrorType.PARAM_INVALID, io, socket);
    return;
  }

  const doc = await Doc.findById(docID);

  // check if doc exists
  if (!doc) {
    responser.sendError(responser.ErrorType.DOC_NOT_FOUND, io, socket);
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  // remove user from doc
  try {
    await Doc.updateOne(
      { _id: docID },
      {
        $unset: {
          [`onlineUsers.${userInfo.id}`]: "",
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }

  // remove working doc from socket
  socket.data.workingDoc = null;

  // send broadcast to all users in doc
  Object.keys(doc.onlineUsers).forEach((user) => {
    if (user !== userInfo.id) {
      const socketID = doc.onlineUsers[user].socketID;
      io.to(socketID).emit("message", {
        type: MessageType.EXITED,
        data: {
          userID: userInfo.id,
        },
      });
    }
  });
};

/**
 * Handle focus message
 * @param io socket server instance
 * @param socket connection socket
 * @param userInfo user info
 * @param position position to focus
 * @returns void
 */
const handleFocusMessage = async (
  io: Server,
  socket: Socket,
  userInfo: UserInfo,
  position: Position
) => {
  // get working doc
  const workingDocID = socket.data?.workingDoc;

  // check if user is working on a doc
  if (!workingDocID) {
    responser.sendError(
      responser.ErrorType.USER_NOT_WORKING_ON_DOC,
      io,
      socket
    );
    return;
  }

  // check if given position is valid
  if (position.length !== 2) {
    responser.sendError(responser.ErrorType.INVALID_POSITION, io, socket);
    return;
  }

  // parse position
  const [col, row] = position;
  if (col < 0) {
    responser.sendError(responser.ErrorType.INVALID_POSITION, io, socket);
    return;
  } else if (row < 0) {
    responser.sendError(responser.ErrorType.INVALID_POSITION, io, socket);
    return;
  }

  const doc = await Doc.findById(workingDocID);

  // check if doc exists
  if (!doc) {
    responser.sendError(responser.ErrorType.DOC_NOT_FOUND, io, socket);
    return;
  }

  // update user focus
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Doc.updateOne(
      { _id: workingDocID },
      {
        $set: {
          [`onlineUsers.${userInfo.id}.focus`]: [col, row],
        },
      },
      { session }
    );

    // send broadcast to all users in doc
    Object.keys(doc.onlineUsers).forEach((user) => {
      const socketID = doc.onlineUsers[user].socketID;
      io.to(socketID).emit("message", {
        type: MessageType.FOCUSED,
        data: {
          userID: userInfo.id,
          position: [col, row],
        },
      });
    });

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }

  // send broadcast to all users in doc
  Object.keys(doc.onlineUsers).forEach((user) => {
    if (user !== userInfo.id) {
      const socketID = doc.onlineUsers[user].socketID;
      io.to(socketID).emit("message", {
        type: MessageType.FOCUSED,
        data: {
          userID: userInfo.id,
          position: [col, row],
        },
      });
    }
  });
};

/**
 * Handle cell update message
 * @param io socket server instance
 * @param socket connection socket
 * @param userInfo user info
 * @param cells cells to update
 * @returns void
 */
const handleUpdateMessage = async (
  io: Server,
  socket: Socket,
  userInfo: UserInfo,
  cells: Array<Cell>
) => {
  // get working doc
  const workingDocID = socket.data?.workingDoc;

  // check if user is working on a doc
  if (!workingDocID) {
    responser.sendError(
      responser.ErrorType.USER_NOT_WORKING_ON_DOC,
      io,
      socket
    );
    return;
  }

  const doc = await Doc.findById(workingDocID);

  // check if doc exists
  if (!doc) {
    responser.sendError(responser.ErrorType.DOC_NOT_FOUND, io, socket);
    return;
  }

  // check if user has permission to edit the doc
  if (doc.users[userInfo.id] !== "EDITOR") {
    responser.sendError(
      responser.ErrorType.NO_PERMISSION_TO_EDIT_DOC,
      io,
      socket
    );
    return;
  }

  // update doc cells
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // update cells
    const updatedCells = doc.cells;
    cells.forEach((cell) => {
      const [col, row] = cell.position;
      if (!updatedCells[col]) {
        updatedCells[col] = [];
      }
      updatedCells[col][row] = {
        type: cell.type,
        value: cell.value,
        meta: cell.meta,
      };
    });

    // initiate the cells to make sure column and row are continuous with same length
    for (let i = 0; i < updatedCells.length; i++) {
      if (!updatedCells[i]) {
        updatedCells[i] = [];
      }
      for (let j = 0; j < updatedCells[i].length; j++) {
        if (!updatedCells[i][j]) {
          updatedCells[i][j] = {
            type: CellType.STRING,
            value: "",
            meta: {},
          };
        }
      }
    }

    await Doc.updateOne(
      { _id: workingDocID },
      {
        $set: { cells: updatedCells },
      },
      { session }
    );

    // send broadcast to all users in doc
    Object.keys(doc.onlineUsers).forEach((user) => {
      if (user !== userInfo.id) {
        const socketID = doc.onlineUsers[user].socketID;
        socket.to(socketID).emit("message", {
          type: MessageType.UPDATED,
          data: {
            cells,
          },
        });
      }
    });

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export default {
  handleJoinMessage,
  handleExitMessage,
  handleFocusMessage,
  handleUpdateMessage,
};

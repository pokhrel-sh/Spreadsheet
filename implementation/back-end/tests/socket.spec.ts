import mongoose from "mongoose";
import { Server, Socket } from "socket.io";
import handler from "../socket/handler";
import responser from "../socket/responser";
import { CellType, Doc } from "../models/docs";
import { UserInfo, MessageType, Position, Cell } from "../socket/message_types";

jest.mock("mongoose");
jest.mock("../socket/responser");
jest.mock("../models/docs");

describe("socket handlers", () => {
  let io: Server;
  let socket: Socket;
  let userInfo: UserInfo;
  let docID: string;

  beforeEach(() => {
    io = {} as Server;
    socket = {
      data: {},
      id: "socketID",
    } as Socket;
    userInfo = { id: "userID", name: "userName" };
    docID = "507f191e810c19729de860ea"; // valid ObjectId

    (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("handleJoinMessage", () => {
    it("should send error if user is already working on another doc", async () => {
      socket.data.workingDoc = "anotherDocID";

      await handler.handleJoinMessage(io, socket, userInfo, docID);

      expect(responser.sendError).toHaveBeenCalledWith(
        responser.ErrorType.USER_ALREADY_WORKING_ON_DOC,
        io,
        socket
      );
    });

    it("should send error if docID is invalid", async () => {
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

      await handler.handleJoinMessage(io, socket, userInfo, docID);

      expect(responser.sendError).toHaveBeenCalledWith(
        responser.ErrorType.PARAM_INVALID,
        io,
        socket
      );
    });

    it("should send error if doc is not found", async () => {
      (Doc.findById as jest.Mock).mockResolvedValue(null);

      await handler.handleJoinMessage(io, socket, userInfo, docID);

      expect(responser.sendError).toHaveBeenCalledWith(
        responser.ErrorType.DOC_NOT_FOUND,
        io,
        socket
      );
    });

    it("should send error if user has no permission to join the doc", async () => {
      const doc = { users: {} };
      (Doc.findById as jest.Mock).mockResolvedValue(doc);

      await handler.handleJoinMessage(io, socket, userInfo, docID);

      expect(responser.sendError).toHaveBeenCalledWith(
        responser.ErrorType.NO_PERMISSION_TO_VIEW_DOC,
        io,
        socket
      );
    });

    it("should successfully join the doc", async () => {
      const doc = { users: { [userInfo.id]: true }, onlineUsers: {} };
      (Doc.findById as jest.Mock).mockResolvedValue(doc);
      const session = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };
      (mongoose.startSession as jest.Mock).mockResolvedValue(session);

      await handler.handleJoinMessage(io, socket, userInfo, docID);

      expect(Doc.updateOne).toHaveBeenCalledWith(
        { _id: docID },
        {
          $set: {
            onlineUsers: {
              [userInfo.id]: {
                focus: ["A", 0],
                socketID: socket.id,
              },
            },
          },
        },
        { session }
      );
      expect(session.commitTransaction).toHaveBeenCalled();
      expect(socket.data.workingDoc).toBe(docID);
    });
  });

  // Similar tests can be written for handleExitMessage, handleFocusMessage, and handleUpdateMessage
  describe("handleExitMessage", () => {
    it("should send error if user is not working on any doc", async () => {
      await handler.handleExitMessage(io, socket, userInfo, docID);

      expect(responser.sendError).toHaveBeenCalledWith(
        responser.ErrorType.USER_NOT_WORKING_ON_DOC,
        io,
        socket
      );
    });

    it("should successfully exit the doc", async () => {
      socket.data.workingDoc = docID;
      const doc = { onlineUsers: { [userInfo.id]: { socketID: socket.id } } };
      (Doc.findById as jest.Mock).mockResolvedValue(doc);
      const session = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };
      (mongoose.startSession as jest.Mock).mockResolvedValue(session);

      await handler.handleExitMessage(io, socket, userInfo, docID);

      expect(Doc.updateOne).toHaveBeenCalledWith(
        { _id: docID },
        { $unset: { [`onlineUsers.${userInfo.id}`]: 1 } },
        { session }
      );
      expect(session.commitTransaction).toHaveBeenCalled();
      expect(socket.data.workingDoc).toBeUndefined();
    });
  });

  describe("handleFocusMessage", () => {
    it("should send error if user is not working on any doc", async () => {
      const position: Position = [0, 0];

      await handler.handleFocusMessage(io, socket, userInfo, position);

      expect(responser.sendError).toHaveBeenCalledWith(
        responser.ErrorType.USER_NOT_WORKING_ON_DOC,
        io,
        socket
      );
    });

    it("should successfully update focus position", async () => {
      socket.data.workingDoc = docID;
      const position: Position = [0, 0];
      const doc = { onlineUsers: { [userInfo.id]: { socketID: socket.id } } };
      (Doc.findById as jest.Mock).mockResolvedValue(doc);
      const session = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };
      (mongoose.startSession as jest.Mock).mockResolvedValue(session);

      await handler.handleFocusMessage(io, socket, userInfo, position);

      expect(Doc.updateOne).toHaveBeenCalledWith(
        { _id: docID },
        { $set: { [`onlineUsers.${userInfo.id}.focus`]: position } },
        { session }
      );
      expect(session.commitTransaction).toHaveBeenCalled();
    });
  });

  describe("handleUpdateMessage", () => {
    it("should send error if user is not working on any doc", async () => {
      const cell: Cell = { position: [0, 0], value: "new content", type: CellType.STRING, meta: {} };

      await handler.handleUpdateMessage(io, socket, userInfo, [cell]);

      expect(responser.sendError).toHaveBeenCalledWith(
        responser.ErrorType.USER_NOT_WORKING_ON_DOC,
        io,
        socket
      );
    });

    it("should successfully update the cell content", async () => {
      socket.data.workingDoc = docID;
      const cell: Cell = { position: [0, 0], value: "new content", type: CellType.STRING, meta: {} };
      const doc = { onlineUsers: { [userInfo.id]: { socketID: socket.id } } };
      (Doc.findById as jest.Mock).mockResolvedValue(doc);
      const session = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };
      (mongoose.startSession as jest.Mock).mockResolvedValue(session);

      await handler.handleUpdateMessage(io, socket, userInfo, [cell]);

      expect(Doc.updateOne).toHaveBeenCalledWith(
        { _id: docID },
        { $set: { [`cells.${cell.position.join(",")}`]: cell.value } },
        { session }
      );
      expect(session.commitTransaction).toHaveBeenCalled();
    });
  });
});
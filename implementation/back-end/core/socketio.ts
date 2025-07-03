import { Server } from "socket.io";
import { httpServer } from "./http";
import { registerHandler } from "../socket";

let io: Server;

/**
 * Initialize Socket.IO server
 */
const initSocketIO = () => {
  // Initialize Socket.IO server
  io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  // Register handler
  registerHandler(io);

  console.log("Socket.IO initialized");
};

export default { initSocketIO };

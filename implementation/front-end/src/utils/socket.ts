import { io, Socket } from "socket.io-client";

// 替换为您的服务端 Socket.io 地址
const SERVER_URL = "http://localhost:3000";

// // 创建 Socket 实例
// const socket = io(SERVER_URL, {
//   transports: ["websocket"],
//   reconnection: true,
// });

let socket: Socket;

export const getSocket = () => {
  return socket;
};

export const connectSocket = (
  userId: string,
  updateCallback: (data: any) => void
) => {
  return new Promise<Socket>((resolve) => {
    socket = io(SERVER_URL, {
      transports: ["websocket"],
      reconnection: true,
      query: {
        userID: userId,
      },
    });

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("message", (messgae) => {
      console.log("Received message:", messgae);
      const { type, data } = messgae;

      switch (type) {
        case "CONNECTED":
          console.log("Connection ready");
          resolve(socket);
          break;
        case "UPDATED":
          updateCallback(data);
          break;
        default:
          console.log("Unknown message type:", type);
          break;
      }
    });
  });
};

export default socket;

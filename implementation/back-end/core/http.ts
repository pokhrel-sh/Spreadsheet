import http from "http";
import express from "express";

export const expressAPP = express();
export const httpServer = http.createServer(expressAPP);

/**
 * Initialize the HTTP server
 */
const initHTTP = () => {
  // Get HTTP Port
  const httpPort = process.env.HTTP_PORT;
  if (!httpPort) {
    throw new Error("PORT environment variable is not defined");
  }

  // Start the Express server
  httpServer.listen(httpPort, () => {
    console.log("Server started successfully");
  });
};

export default {
  expressAPP,
  initHTTP,
};

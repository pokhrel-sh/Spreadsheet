import core from "./core";
import { initRouters } from "./routers";

// // Import types to ensure they are included in the final build
// import './types/session.d.ts';
import "express-session";

let initFlag = false;

export const init = async () => {
  if (initFlag) {
    return;
  }

  initFlag = true;

  // Load environment variables from .env file
  core.config.initConfig();

  // Init MongoDB connection
  if (await core.db.initDB()) {
    console.log("MongoDB connection successful");
  } else {
    console.error("MongoDB connection failed");
    return;
  }

  // Start the Express server
  core.http.initHTTP();

  // Initialize the routers
  initRouters();

  // Initialize Socket.IO
  core.socketio.initSocketIO();
};

init();

import express from "express";

import { helloworld } from "../controllers";

const bindHelloWorldRoutes = (): express.Router => {
  // Create a new router
  const router = express.Router();

  router.get("/", helloworld);

  return router;
};

export default {
  bindHelloWorldRoutes,
};

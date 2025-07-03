import express from "express";

import { userInfo } from "../controllers/users/info";
import { userLogin } from "../controllers/users/login";
import { userLogout } from "../controllers/users/logout";
import { userSearch } from "../controllers/users";

const bindUserNoAuthRoutes = (): express.Router => {
  // Create a new router
  const router = express.Router();

  router.post("/login", userLogin);

  return router;
};

const bindUserNeedAuthRoutes = (): express.Router => {
  // Create a new router
  const router = express.Router();

  router.get("/", userSearch);
  router.get("/info", userInfo);
  router.post("/logout", userLogout);

  return router;
};

export default {
  bindUserNoAuthRoutes,
  bindUserNeedAuthRoutes,
};

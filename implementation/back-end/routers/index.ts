import { expressAPP } from "../core/http";
import bodyParser from "body-parser";

import helloworldRouter from "./helloworld";
import docsRouter from "./docs";
import usersRouter from "./users";

import middlewares from "../middlewares";
import { errorCommon } from "../models/responser/response";
import { ErrorCode } from "../models/responser/error_code";

/**
 * Initialize the routers
 */
const initRouters = () => {
  // Bind body parser middleware
  expressAPP.use(bodyParser.urlencoded({ extended: true }));
  expressAPP.use(bodyParser.json());

  // Bind session middleware
  expressAPP.use(middlewares.sessionMiddleware());

  // Bind CORS middleware
  expressAPP.use(middlewares.corsMiddleware);

  // Bind no auth required routers
  expressAPP.use("/users", usersRouter.bindUserNoAuthRoutes());

  // Bind auth middleware
  expressAPP.use(middlewares.authMiddleware);

  // Bind auth required router
  expressAPP.get("/", helloworldRouter.bindHelloWorldRoutes());
  expressAPP.use("/docs", docsRouter.bindDocsRoutes());
  expressAPP.use("/users", usersRouter.bindUserNeedAuthRoutes());

  // Handle Not Found
  expressAPP.use("*", (req, res) => {
    errorCommon(ErrorCode.NotFound, res);
  });
};

export { initRouters };

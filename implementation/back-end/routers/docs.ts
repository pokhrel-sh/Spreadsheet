import express from "express";

import { docCreate, docDelete, docGet } from "../controllers/docs";
import { docHistoryCreate, docHistoryGet } from "../controllers/docs/history";
import { docHistoryRollback } from "../controllers/docs/history/rollback";
import { docHistoryList } from "../controllers/docs/history/list";
import {
  docUsersAdd,
  docUsersList,
  docUsersRemove,
} from "../controllers/docs/users";

const bindDocsRoutes = (): express.Router => {
  // Create a new router
  const router = express.Router();

  router.get("/:docID", docGet);
  router.post("/", docCreate);
  router.delete("/:docID", docDelete);

  router.get("/history/:versionID", docHistoryGet);
  router.post("/:docID/history", docHistoryCreate);

  router.get("/:docID/history/list", docHistoryList);

  router.post("/history/:id/rollback", docHistoryRollback);

  router.get("/:docID/users", docUsersList);
  router.post("/:docID/users/:userID", docUsersAdd);
  router.delete("/:docID/users/:userID", docUsersRemove);

  return router;
};

export default {
  bindDocsRoutes,
};

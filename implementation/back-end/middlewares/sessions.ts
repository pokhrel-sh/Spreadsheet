import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";

/**
 * Get the Session Secret
 * @returns Session Secret
 */
const getDBName = (): string => {
  const dbName = process.env.SESSION_DB_NAME;
  if (!dbName) {
    throw new Error("SESSION_DB_NAME environment variable is not defined");
  }
  return dbName;
};

/**
 * Get the Session Secret
 * @returns Session Secret
 */
const getSecret = (): string => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not defined");
  }
  return secret;
};

export const sessionMiddleware = () =>
  session({
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
      dbName: getDBName(),
      autoRemove: "interval",
      autoRemoveInterval: 10,
    }),
    secret: getSecret(),
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    },
  });

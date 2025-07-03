import mongoose from "mongoose";

/**
 * Initialize the MongoDB connection
 * @returns Boolean if the connection was successful
 */
const initDB = async (): Promise<boolean> => {
  // Get DB Host
  const dbHost = process.env.DB_HOST;
  if (!dbHost) {
    throw new Error("DB_HOST environment variable is not defined");
  }

  // Get DB Port
  const dbPort = process.env.DB_PORT;
  if (!dbPort) {
    throw new Error("DB_PORT environment variable is not defined");
  }

  // Get DB Name
  const dbName = process.env.DB_NAME;
  if (!dbName) {
    throw new Error("DB_NAME environment variable is not defined");
  }

  // Get DB User
  const dbUser = process.env.DB_USER || "";

  // Get DB Password
  const dbPassword = process.env.DB_PASS || "";

  // Get DB Auth Source
  const dbAuthSource = process.env.DB_AUTH_SOURCE || "admin";

  // Construct the MongoDB connection string
  const dbUri = `mongodb://${dbHost}:${dbPort}/${dbName}?authSource=${dbAuthSource}&directConnection=true`;

  // Connect to MongoDB
  try {
    await mongoose.connect(dbUri, {
      user: dbUser,
      pass: dbPassword,
    });
    return true;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return false;
  }
};

export default {
  initDB,
};

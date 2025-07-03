import dotenv from "dotenv";

/**
 * Initialize the configuration from the .env file
 */
const initConfig = () => {
  const result = dotenv.config();

  if (result.parsed) {
    for (const key in result.parsed) {
      process.env[key] = result.parsed[key];
    }
  }
};

export default {
  initConfig,
};

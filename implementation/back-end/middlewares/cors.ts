import cors from "cors";

/**
 * Check if the given origin is allowed
 * @param origin origin of the request
 * @param callback callback function
 */
const checkOrigin = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
) => {
  if (!origin) {
    callback(null, false);
    return;
  }

  const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];
  const isAllowed = allowedOrigins.some((allowedOrigin) => {
    return origin === allowedOrigin;
  });

  callback(null, isAllowed);
};

const corsOptions = {
  credentials: true,
  origin: checkOrigin,
  optionsSuccessStatus: 204,
};

export const corsMiddleware = cors(corsOptions);

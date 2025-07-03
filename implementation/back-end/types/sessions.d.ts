import session from "express-session";

declare module "express-session" {
  export interface SessionData {
    user: { [key: string]: any };
  }
}

declare module "express" {
  interface Request {
    session: session.Session & Partial<session.SessionData>;
  }
}

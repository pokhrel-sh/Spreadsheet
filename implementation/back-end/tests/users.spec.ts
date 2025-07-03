import request from "supertest";

import { expressAPP } from "../core/http";
import { ErrorCode, errorMsg } from "../models/responser/error_code";
import { initRouters } from "../routers";
import { USER_CREDENTIALS } from "./constants";
import { UserLoginErrorCodes, userLoginErrorMessages } from "../controllers/users/login";
import core from "../core";

describe("users", () => {
  beforeAll(async () => {
    core.config.initConfig();
    await core.db.initDB();
    initRouters();
  });

  it("get user info", async () => {
    const res = await request(expressAPP).get("/users/info");

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("code", ErrorCode.Unauthorized);
    expect(res.body).toHaveProperty("msg", errorMsg[ErrorCode.Unauthorized]);
  });

  it("login success", async () => {
    const loginRes = await request(expressAPP).post("/users/login").send(USER_CREDENTIALS);

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("code", 0);
    expect(loginRes.body).toHaveProperty("msg");
    expect(["Login success", "Registered success"]).toContain(loginRes.body.msg);

    const cookies = loginRes.headers["set-cookie"];

    const infoRes = await request(expressAPP).get("/users/info").set("Cookie", cookies);

    expect(infoRes.status).toBe(200);
    expect(infoRes.body).toHaveProperty("code", 0);
    expect(infoRes.body).toHaveProperty("msg");
    expect(infoRes.body).toHaveProperty("data");
    expect(infoRes.body.data).toHaveProperty("username", USER_CREDENTIALS.username);

    const logoutRes = await request(expressAPP).post("/users/logout").set("Cookie", cookies);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body).toHaveProperty("code", 0);
    expect(logoutRes.body).toHaveProperty("msg");

    const infoResAfterLogout = await request(expressAPP).get("/users/info").set("Cookie", cookies);

    expect(infoResAfterLogout.status).toBe(401);
    expect(infoResAfterLogout.body).toHaveProperty("code", ErrorCode.Unauthorized);
    expect(infoResAfterLogout.body).toHaveProperty("msg", errorMsg[ErrorCode.Unauthorized]);
  });

  it("login failed", async () => {
    const res = await request(expressAPP).post("/users/login").send({
      username: "unittest",
      password: "wrong_password"
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("code", UserLoginErrorCodes.WRONG_USERNAME_OR_PASSWORD);
    expect(res.body).toHaveProperty("msg", userLoginErrorMessages[UserLoginErrorCodes.WRONG_USERNAME_OR_PASSWORD]);
  });
});

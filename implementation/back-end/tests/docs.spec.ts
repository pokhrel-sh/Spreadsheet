import request from "supertest";

import { expressAPP } from "../core/http";
import { initRouters } from "../routers";
import { USER_CREDENTIALS } from "./constants";
import core from "../core";
import { Role } from "../models/docs";

let cookies: string = "";
let docId: string = "";

describe("users", () => {
  beforeAll(async () => {
    core.config.initConfig();
    await core.db.initDB();
    initRouters();

    const loginRes = await request(expressAPP).post("/users/login").send(USER_CREDENTIALS);
    cookies = loginRes.headers["set-cookie"];
  });

  it("create doc", async () => {
    const res = await request(expressAPP).post("/docs").set("Cookie", cookies).send({
      name: "test doc",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("code", 0);
    expect(res.body).toHaveProperty("msg");
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("_id");

    docId = res.body.data._id;
  });

  it("get doc", async () => {
    const res = await request(expressAPP).get(`/docs/${docId}`).set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("code", 0);
    expect(res.body).toHaveProperty("msg");
    expect(res.body).toHaveProperty("data");
    expect(res.body.data.doc).toHaveProperty("_id", docId);
    expect(res.body.data.doc).toHaveProperty("name", "test doc");
    expect(res.body.data.doc).toHaveProperty("cells");
    expect(res.body.data.doc.cells.length).toBe(1);
    expect(res.body.data.doc.cells[0].length).toBe(1);
    expect(res.body.data.role).toBe(Role.EDITOR);
    expect(res.body.data.onlineUsers.length).toBe(0);
  });

  it("add user to doc", async () => {
    // create a new user, username is current timestamp
    const newUserRegistereRes = await request(expressAPP).post("/users/login").send({
      username: "unittest_" + Date.now().toString(),
      password: "unittest",
    });

    const newUserCookies = newUserRegistereRes.headers["set-cookie"];

    // get user id
    const newUserInfoRes = await request(expressAPP).get("/users/info").set("Cookie", newUserCookies);

    const newUserId = newUserInfoRes.body.data._id;

    const res = await request(expressAPP).post(`/docs/${docId}/users/${newUserId}`).set("Cookie", cookies).send({
      role: Role.VIEWER,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("code", 0);
    expect(res.body).toHaveProperty("msg");

    // list users in doc
    const listRes = await request(expressAPP).get(`/docs/${docId}/users`).set("Cookie", cookies);

    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveProperty("code", 0);
    expect(listRes.body).toHaveProperty("msg");
    expect(listRes.body).toHaveProperty("data");
    const user = listRes.body.data.find((user: any) => user._id === newUserId);
    expect(user).toBeDefined();
    expect(user.role).toBe(Role.VIEWER);
  });

  it("history version", async () => {
    const res = await request(expressAPP).get(`/docs/${docId}/history/list?limit=10`).set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("code", 0);
    expect(res.body).toHaveProperty("msg");
    expect(res.body).toHaveProperty("data");
    expect(res.body.data.length).toBe(0);

    // create a new version
    const createVersionRes = await request(expressAPP).post(`/docs/${docId}/history`).set("Cookie", cookies).send({
      description: "Initial version",
    });

    expect(createVersionRes.status).toBe(200);
    expect(createVersionRes.body).toHaveProperty("code", 0);
    expect(createVersionRes.body).toHaveProperty("msg");
    expect(createVersionRes.body).toHaveProperty("data");
    expect(createVersionRes.body.data).toHaveProperty("_id");

    const versionId = createVersionRes.body.data._id;

    // get history version
    const getVersionRes = await request(expressAPP).get(`/docs/history/${versionId}`).set("Cookie", cookies);

    expect(getVersionRes.status).toBe(200);
    expect(getVersionRes.body).toHaveProperty("code", 0);
    expect(getVersionRes.body).toHaveProperty("msg");
    expect(getVersionRes.body).toHaveProperty("data");
    expect(getVersionRes.body.data).toHaveProperty("_id", versionId);

    // rollback to version
    const rollbackRes = await request(expressAPP).post(`/docs/history/${versionId}/rollback`).set("Cookie", cookies);

    expect(rollbackRes.status).toBe(200);
    expect(rollbackRes.body).toHaveProperty("code", 0);
    expect(rollbackRes.body).toHaveProperty("msg");

    // get history version list
    const listRes = await request(expressAPP).get(`/docs/${docId}/history/list?limit=10`).set("Cookie", cookies);

    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveProperty("code", 0);
    expect(listRes.body).toHaveProperty("msg");
    expect(listRes.body).toHaveProperty("data");
    expect(listRes.body.data.length).toBe(2);
  });

  it("delete doc", async () => {
    const res = await request(expressAPP).delete(`/docs/${docId}`).set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("code", 0);
    expect(res.body).toHaveProperty("msg");
  });
});

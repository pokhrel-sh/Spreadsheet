import request from "supertest";

import { expressAPP } from "../core/http";
import helloworldRouter from "../routers/helloworld";

describe("hello world", () => {
  beforeAll(() => {
    expressAPP.use("/", helloworldRouter.bindHelloWorldRoutes());
  });

  it("should return Hello World", async () => {
    const res = await request(expressAPP).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("code", 0);
    expect(res.body).toHaveProperty("msg", "Hello World");
  });
});

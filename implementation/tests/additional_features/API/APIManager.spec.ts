import * as fs from "fs";
import { SerializedAPIManager } from "../../../front-end/src/additional_features/API/APIManager";

describe("Simple API Manager Testing", (): void => {
  let simpleManager: SerializedAPIManager;

  beforeEach((): void => {
    simpleManager = new SerializedAPIManager();
  });

  it("Adding and saving a configuration should be successful", async (): Promise<void> => {
    const outputFilePath = `${__dirname}/output.json`;

    simpleManager.addConfiguration(
      "Test API",
      "www.test.com",
      "12345678",
      new Map<string, string>()
    );
    const apiConfig = {
      apiKey: "12345678",
      endpoint: "www.test.com",
      keywordArgs: {},
      name: "Test API",
    };

    await simpleManager.saveConfigurations(outputFilePath);

    const savedData = JSON.parse(fs.readFileSync(outputFilePath, "utf8"));

    expect(savedData["Test API"]).toBeDefined();

    fs.unlinkSync(outputFilePath);
  });
});

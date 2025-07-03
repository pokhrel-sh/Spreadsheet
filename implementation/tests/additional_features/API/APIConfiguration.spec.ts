import axios from "axios";
import { APIConfiguration } from "../../../front-end/src/additional_features/API/APIConfiguration";

jest.mock("axios");

describe("Simple API Configuration Testing", (): void => {
  let simpleConfiguration: APIConfiguration;

  beforeEach((): void => {
    simpleConfiguration = new APIConfiguration(
      "Test API",
      "www.test.com",
      "12345678",
      new Map<string, string>()
    );
  });

  it("Fetching the name of a configuration should be successful", (): void => {
    expect(simpleConfiguration.getName()).toBe("Test API");
  });

  it("Fetching the endpoint of a configuration should be successful", (): void => {
    expect(simpleConfiguration.getEndpoint()).toBe("www.test.com");
  });

  it("Fetching the key of a configuration should be successful", (): void => {
    expect(simpleConfiguration.getAPIKey()).toBe("12345678");
  });

  it("Fetching the keywordArgs of a configuration should be successful", (): void => {
    expect(simpleConfiguration.getKeywordArgs().size).toBe(0);
  });

  it("should return data on successful API call", async () => {
    // Mock axios to return a successful response
    const mockResponseData = "Successful response data";
    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue({
      data: mockResponseData,
    });

    // Call the method and assert the output
    const result = await simpleConfiguration.callAPI();

    expect(axios.get).toHaveBeenCalledWith(simpleConfiguration.getEndpoint(), {
      params: { appid: simpleConfiguration.getAPIKey() },
    });
    expect(result).toBe(mockResponseData);
  });

  it("should return error config on API call failure", async () => {
    // Mock axios.get to reject with an error containing config
    const mockError = {
      config: { errorConfigKey: "errorConfigValue" },
    };
    (axios.get as jest.MockedFunction<typeof axios.get>).mockRejectedValueOnce(
      mockError
    );

    const params = {
      appid: simpleConfiguration.getAPIKey(),
    };

    const result = await simpleConfiguration.callAPI();

    expect(axios.get).toHaveBeenCalledWith(simpleConfiguration.getEndpoint(), {
      params,
    });
    expect(result).toEqual(mockError.config);
  });
});

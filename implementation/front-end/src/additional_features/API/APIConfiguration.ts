import axios from "axios";
import { IAPIConfiguration } from "./IAPIConfiguration";

/**
 * Class representing a single API configuration.
 */
export class APIConfiguration implements IAPIConfiguration {
  /**
   * The name of the API.
   */
  private name: string;

  /**
   * The endpoint URL of the API.
   */
  private endpoint: string;

  /**
   * The API key used for authentication.
   */
  private apiKey: string;

  /**
   * A map of keyword arguments used in API calls.
   */
  private keywordArgs: Map<string, string>;

  /**
   * Creates a new instance of `APIConfiguration`.
   * @param name - The name of the API.
   * @param endpoint - The endpoint URL of the API.
   * @param apiKey - The API key used for authentication.
   * @param keywordArgs - A map of keyword arguments for API calls.
   */
  constructor(
    name: string,
    endpoint: string,
    apiKey: string,
    keywordArgs: Map<string, string>
  ) {
    this.name = name;
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.keywordArgs = keywordArgs;
  }

  /**
   * Updates the API endpoint.
   * @param endpoint - The new endpoint URL as a string.
   */
  public updateEndpoint(endpoint: string): void {
    this.endpoint = endpoint;
  }

  /**
   * Updates the API key used for authentication.
   * @param apiKey - The new API key as a string.
   */
  public updateAPIKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Updates or adds a key-value pair to the keyword arguments.
   * @param key - The name of the keyword argument.
   * @param value - The value of the keyword argument.
   */
  public updateKeywordArgs(key: string, value: string): void {
    this.keywordArgs.set(key, value);
  }

  /**
   * Makes an API call using the current configuration.
   * @returns A promise resolving to the API response as a string.
   */
  public async callAPI(): Promise<string> {
    this.keywordArgs.set("appid", this.apiKey);
    const keyRecord: Record<string, string> = Object.fromEntries(
      this.keywordArgs
    );
    let output = "";

    try {
      const response = await axios.get(this.endpoint, { params: keyRecord });
      output = response.data; // Successful response
    } catch (error) {
      output = error.config; // Handle error
    }

    return output;
  }

  /**
   * Retrieves the name of the API.
   * @returns The name of the API as a string.
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Retrieves the current API endpoint.
   * @returns The current API endpoint as a string.
   */
  public getEndpoint(): string {
    return this.endpoint;
  }

  /**
   * Retrieves the current API key.
   * @returns The current API key as a string.
   */
  public getAPIKey(): string {
    return this.apiKey;
  }

  /**
   * Retrieves the current keyword arguments.
   * @returns A map of keyword argument keys and values.
   */
  public getKeywordArgs(): Map<string, string> {
    return this.keywordArgs;
  }
}

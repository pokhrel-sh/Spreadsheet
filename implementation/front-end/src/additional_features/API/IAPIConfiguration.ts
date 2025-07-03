/**
 * Interface representing an API configuration.
 */
export interface IAPIConfiguration {
  /**
   * Updates the API endpoint.
   * @param endpoint - The new endpoint URL as a string.
   */
  updateEndpoint(endpoint: string): void;

  /**
   * Updates the API key used for authentication.
   * @param apiKey - The new API key as a string.
   */
  updateAPIKey(apiKey: string): void;

  /**
   * Updates or adds a key-value pair for additional keyword arguments.
   * @param key - The name of the keyword argument.
   * @param value - The value of the keyword argument.
   */
  updateKeywordArgs(key: string, value: string): void;

  /**
   * Makes an API call using the current configuration.
   * @returns A promise resolving to the response string from the API.
   */
  callAPI(): Promise<string>;

  /**
   * Retrieves the name of the API.
   * @returns The name of the API as a string.
   */
  getName(): string;

  /**
   * Retrieves the current API endpoint.
   * @returns The current API endpoint as a string.
   */
  getEndpoint(): string;

  /**
   * Retrieves the current API key.
   * @returns The current API key as a string.
   */
  getAPIKey(): string;

  /**
   * Retrieves the current keyword arguments.
   * @returns A map of keyword argument keys and values.
   */
  getKeywordArgs(): Map<string, string>;
}

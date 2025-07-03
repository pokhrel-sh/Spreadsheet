import { IAPIConfiguration } from "./IAPIConfiguration";

/**
 * Interface representing a manager for API configurations.
 */
export interface IAPIManager {
  /**
   * Retrieves all API configurations managed by this instance.
   * @returns A map of configuration names to their corresponding `IAPIConfiguration` instances.
   */
  getConfigs(): Map<string, IAPIConfiguration>;

  /**
   * Queries an API by its name.
   * @param name - The name of the API configuration to query.
   * @returns A promise resolving to the response string from the API.
   */
  queryAPI(name: string): Promise<string>;

  /**
   * Loads API configurations from a file and instantiates them as a specified class type.
   * @template T - A class that extends `IAPIConfiguration`.
   * @param filePath - The path to the configuration file.
   * @param classType - The class constructor for the `IAPIConfiguration` implementation.
   * @returns A promise that resolves when configurations are loaded.
   */
  loadConfigurations<T extends IAPIConfiguration>(
    filePath: string,
    classType: { new (...args: any[]): T }
  ): Promise<void>;

  /**
   * Adds a new API configuration to the manager.
   * @param name - The name of the new API configuration.
   * @param endpoint - The endpoint URL for the API.
   * @param apiKey - The API key for authentication.
   * @param keywordArgs - A map of additional keyword arguments for the API.
   */
  addConfiguration(
    name: string,
    endpoint: string,
    apiKey: string,
    keywordArgs: Map<string, string>
  ): void;
}

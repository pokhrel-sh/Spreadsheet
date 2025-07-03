import * as path from "path";
import * as fs from "fs";
import { IAPIManager } from "./IAPIManager";
import { IAPIConfiguration } from "./IAPIConfiguration";
import { APIConfiguration } from "./APIConfiguration";

/**
 * Class implementing the `IAPIManager` interface for serialized API management.
 */
export class SerializedAPIManager implements IAPIManager {
  /**
   * A map storing API configurations by name.
   */
  private managedAPIs: Map<string, IAPIConfiguration>;

  /**
   * Creates a new instance of `SerializedAPIManager`.
   */
  constructor() {
    this.managedAPIs = new Map<string, IAPIConfiguration>();
  }

  /**
   * Retrieves all managed API configurations.
   * @returns A map of configuration names to their corresponding `IAPIConfiguration` instances.
   */
  public getConfigs(): Map<string, IAPIConfiguration> {
    return this.managedAPIs;
  }

  /**
   * Queries an API by its name.
   * @param name - The name of the API configuration to query.
   * @returns A promise resolving to the response string from the API.
   */
  public async queryAPI(name: string): Promise<string> {
    return this.managedAPIs.get(name).callAPI();
  }

  /**
   * Loads API configurations from a JSON file and instantiates them as a specified class type.
   * @template T - A class that extends `IAPIConfiguration`.
   * @param filePath - The path to the JSON file containing the configurations.
   * @param classType - The class constructor for the `IAPIConfiguration` implementation.
   * @returns A promise that resolves when configurations are loaded.
   */
  public async loadConfigurations<T extends IAPIConfiguration>(
    filePath: string,
    classType: { new (...args: any[]): T }
  ): Promise<void> {
    try {
      const fullPath = path.resolve(filePath);
      const fileContents = await fs.promises.readFile(fullPath, "utf-8");
      const jsonData = JSON.parse(fileContents);

      if (!Array.isArray(jsonData)) {
        throw new Error("Expected JSON file to contain an array.");
      }

      jsonData.forEach((item: any) => {
        const instance: IAPIConfiguration = new classType(
          ...Object.values(item)
        );
        const name = instance.getName();
        this.managedAPIs.set(name, instance);
      });
    } catch (error) {
      console.error("Error loading JSON file:", error);
    }
  }

  /**
   * Adds a new API configuration to the manager.
   * @param name - The name of the new API configuration.
   * @param endpoint - The endpoint URL for the API.
   * @param apiKey - The API key for authentication.
   * @param keywordArgs - A map of additional keyword arguments for the API.
   */
  public addConfiguration(
    name: string,
    endpoint: string,
    apiKey: string,
    keywordArgs: Map<string, string>
  ): void {
    const newConfig: APIConfiguration = new APIConfiguration(
      name,
      endpoint,
      apiKey,
      keywordArgs
    );
    this.managedAPIs.set(name, newConfig);
  }

  /**
   * Saves all managed API configurations to a JSON file.
   * @param outputFilePath - The path where the JSON file should be saved.
   * @returns A promise that resolves when the configurations are saved.
   */
  public async saveConfigurations(outputFilePath: string): Promise<void> {
    try {
      const outputData: Record<string, any> = {};

      // Convert the Map to an object format for JSON serialization
      this.managedAPIs.forEach((instance, name) => {
        outputData[name] = instance;
      });

      // Convert the output data to JSON format
      const jsonContent = JSON.stringify(outputData, null, 2);
      const fullPath = path.resolve(outputFilePath);

      await fs.promises.writeFile(fullPath, jsonContent, "utf-8");
      console.log(`Configurations saved to ${fullPath}`);
    } catch (error) {
      console.error("Error saving configurations to JSON file:", error);
    }
  }
}

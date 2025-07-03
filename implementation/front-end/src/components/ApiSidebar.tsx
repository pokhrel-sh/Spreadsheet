import React, { useState } from "react";
import "./ApiSidebar.css";

interface ApiConfig {
  name: string;
  url: string;
  inputSchema: string;
  outputSchema: string;
  apiKey: string;
}

const ApiSidebar: React.FC = () => {
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [selectedApi, setSelectedApi] = useState<ApiConfig | null>(null);
  const [newApiConfig, setNewApiConfig] = useState<ApiConfig>({
    name: "",
    url: "",
    inputSchema: "",
    outputSchema: "",
    apiKey: "",
  });

  const handleAddApi = () => {
    setApiConfigs([...apiConfigs, newApiConfig]);
    setNewApiConfig({
      name: "",
      url: "",
      inputSchema: "",
      outputSchema: "",
      apiKey: "",
    });
  };

  const handleSelectApi = (api: ApiConfig) => {
    setSelectedApi(api);
  };

  const handleUpdateApi = () => {
    setApiConfigs(
      apiConfigs.map((api) =>
        api.name === selectedApi?.name ? selectedApi : api
      )
    );
    setSelectedApi(null);
  };

  return (
    <div className="api-sidebar">
      <h3>Manage API Configurations</h3>
      <div className="api-list">
        {apiConfigs.map((api) => (
          <div
            key={api.name}
            className={`api-item ${
              selectedApi?.name === api.name ? "selected" : ""
            }`}
            onClick={() => handleSelectApi(api)}
          >
            {api.name}
          </div>
        ))}
      </div>
      <div className="api-config-form">
        <h4>{selectedApi ? "Edit API Configuration" : "Add New API"}</h4>
        <input
          type="text"
          placeholder="API Name"
          value={selectedApi ? selectedApi.name : newApiConfig.name}
          onChange={(e) =>
            selectedApi
              ? setSelectedApi({ ...selectedApi, name: e.target.value })
              : setNewApiConfig({ ...newApiConfig, name: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Endpoint URL"
          value={selectedApi ? selectedApi.url : newApiConfig.url}
          onChange={(e) =>
            selectedApi
              ? setSelectedApi({ ...selectedApi, url: e.target.value })
              : setNewApiConfig({ ...newApiConfig, url: e.target.value })
          }
        />
        <textarea
          placeholder="Input Schema"
          value={
            selectedApi ? selectedApi.inputSchema : newApiConfig.inputSchema
          }
          onChange={(e) =>
            selectedApi
              ? setSelectedApi({ ...selectedApi, inputSchema: e.target.value })
              : setNewApiConfig({
                  ...newApiConfig,
                  inputSchema: e.target.value,
                })
          }
        />
        <textarea
          placeholder="Output Schema"
          value={
            selectedApi ? selectedApi.outputSchema : newApiConfig.outputSchema
          }
          onChange={(e) =>
            selectedApi
              ? setSelectedApi({ ...selectedApi, outputSchema: e.target.value })
              : setNewApiConfig({
                  ...newApiConfig,
                  outputSchema: e.target.value,
                })
          }
        />
        <input
          type="text"
          placeholder="API Key"
          value={selectedApi ? selectedApi.apiKey : newApiConfig.apiKey}
          onChange={(e) =>
            selectedApi
              ? setSelectedApi({ ...selectedApi, apiKey: e.target.value })
              : setNewApiConfig({ ...newApiConfig, apiKey: e.target.value })
          }
        />
        <button onClick={selectedApi ? handleUpdateApi : handleAddApi}>
          {selectedApi ? "Update API" : "Add API"}
        </button>
      </div>
    </div>
  );
};

export default ApiSidebar;

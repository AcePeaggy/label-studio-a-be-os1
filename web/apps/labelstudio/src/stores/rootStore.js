import { AppStore } from "libs/datamanager/src/stores/AppStore";
import { API_CONFIG as AppWideApiConfig } from "../config/ApiConfig";

const createStoreEnvironment = () => {
  const apiClient = {};

  const buildUrl = (pathTemplate, pathParams = {}) => {
    let populatedPath = pathTemplate;
    for (const key in pathParams) {
      populatedPath = populatedPath.replace(
        `:${key}`,
        encodeURIComponent(pathParams[key])
      );
    }
    // Remove any unpopulated optional path params like /:optional? or handle them as needed
    populatedPath = populatedPath.replace(/\/:[^/]+\?$/, "");
    return `${AppWideApiConfig.gateway}${populatedPath}`;
  };

  // Dynamically create API methods based on AppWideApiConfig.endpoints
  // This is a common pattern. You'll need to adapt it to how your `self.API[methodName](requestParams, config)`
  // expects `requestParams` (is it for path, query, or both?) and `config` (for body, headers).
  // const result = yield self.API[methodName](requestParams, {
  //   headers: requestHeaders,
  //   body: requestBody.body ?? requestBody,
  //   options
  // });

  for (const methodName in AppWideApiConfig.endpoints) {
    if (
      Object.prototype.hasOwnProperty.call(
        AppWideApiConfig.endpoints,
        methodName
      )
    ) {
      const endpointConfig = AppWideApiConfig.endpoints[methodName];
      let pathTemplate = endpointConfig;
      let httpMethod = "GET"; // Default to GET

      if (typeof endpointConfig === "string" && endpointConfig.includes(":")) {
        [httpMethod, pathTemplate] = endpointConfig.split(":");
      } else if (typeof endpointConfig === "object" && endpointConfig.path) {
        // For complex configs like `skipTask`
        pathTemplate = endpointConfig.path; // May need dynamic resolution if path is a function
        httpMethod = endpointConfig.method?.toUpperCase() || "POST";
      }
      // If endpointConfig is just a path string, it defaults to GET.

      apiClient[methodName] = async (requestParams = {}, config = {}) => {
        // requestParams might contain path variables (like { pk: 123 })
        // and/or query parameters.
        // config usually contains { body, headers, options }
        let url = buildUrl(pathTemplate, requestParams);

        // Simple query param handling (add to this if more complex)
        const queryParams = new URLSearchParams();
        for (const key in requestParams) {
          if (pathTemplate && !pathTemplate.includes(`:${key}`)) {
            // If not a path param, assume query
            queryParams.append(key, requestParams[key]);
          }
        }
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }

        console.log(
          `[rootStore Env] API Call - Method: ${httpMethod}, URL: ${url}, Body:`,
          config.body
        );

        const fetchOptions = {
          method: httpMethod,
          headers: {
            "Content-Type": "application/json",
            // Add other default headers, like Auth tokens if available globally
            ...(config.headers || {})
          }
        };

        if (config.body) {
          fetchOptions.body = JSON.stringify(config.body);
        }
        if (config.options?.signal) {
          fetchOptions.signal = config.options.signal;
        }

        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `[rootStore Env] API Error for ${methodName}: ${response.status}`,
            errorText
          );
          throw new Error(
            `API Error for ${methodName}: ${response.status} - ${errorText}`
          );
        }
        if (response.status === 204) {
          // No content
          return null;
        }
        return response.json();
      };
    }
  }

  const sdkObject = {
    api: apiClient,
    apiVersion: AppWideApiConfig.apiVersion || 2, // Use version from config or default
    // Add other SDK properties/methods AppStore.js expects on `self.SDK`
    // These are placeholders; fill them based on AppStore's usage of self.SDK
    type: "global-sdk", // To differentiate if needed
    settings: {
      /* default or relevant settings */
    },
    polling: false,
    showPreviews: false,
    lsf: {
      /* LSF functionalities if AppStore uses self.SDK.lsf */
    },
    invoke: (eventName, ...args) =>
      console.log(`[rootStore Env] SDK invoked: ${eventName}`, args),
    setMode: mode => console.log(`[rootStore Env] SDK setMode: ${mode}`),
    destroyLSF: () => console.log("[rootStore Env] SDK destroyLSF called"),
    updateActions: actions =>
      console.log("[rootStore Env] SDK updateActions called", actions),
    getAction: actionId => {
      console.log(`[rootStore Env] SDK getAction for ${actionId}`);
      return null;
    },
    reload: () => console.log("[rootStore Env] SDK reload called")
    // Ensure all methods and properties AppStore might access on `self.SDK` are defined.
  };

  return { sdk: sdkObject };
};

const environment = createStoreEnvironment();

// Create the single instance of your AppStore.
// The initial snapshot is typically empty if defaults are defined in the model.
export const rootStore = AppStore.create(
  {
    /* You can provide an initial snapshot here if needed, e.g.:
    project: { id: null, title: "Loading Project..." },
    currentUser: null,
    */
  },
  environment // This environment is passed to MST create method
);

// CRITICAL: Handling `self._sdk`
// Your AppStore.js uses `get SDK() { return self._sdk; }`.
// `_sdk` is not a model property, so `DataManager` likely sets it imperatively.
// To make the global `rootStore` work similarly without changing AppStore.js to use `getEnv()`:
if (rootStore) {
  // This makes `self._sdk` available within AppStore instance methods and views.
  // Cast to `any` to bypass TypeScript strictness if `_sdk` is not formally typed on AppStore.
  rootStore._sdk = environment.sdk;

  // Now, the `afterCreate` hook in AppStore (which calls `self.fetchCurrentUser()`)
  // should be able to function, as `self.SDK` will resolve.
  // And actions like `self.apiCall` which use `self.API` (derived from `self.SDK`) will also work.
}

// `rootStore.fetchCurrentUser()` will be called via the `afterCreate` hook in AppStore.js
// (Assuming you've kept that modification in AppStore.js)

import React, { createContext, useContext } from "react";
import { rootStore } from "../stores/rootStore";

const AppStoreContext = createContext(rootStore);
AppStoreContext.displayName = "AppStoreContext";

export const StoreProvider = ({ children }) => {
  return (
    <AppStoreContext.Provider value={rootStore}>
      {children}
    </AppStoreContext.Provider>
  );
};

export const useStore = () => {
  const store = useContext(AppStoreContext);
  if (!store) {
    throw new Error(
      "useStore() must be used within an <AppStoreProvider> component tree."
    );
  }
  return store;
};

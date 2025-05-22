import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo
} from "react";
import { useAPI } from "./ApiProvider";

const LOCALSTORAGE_IS_STAFF_KEY = "user_is_staff";

const CurrentUserContext = createContext({
  user: undefined,
  fetch: () => Promise.resolve(),
  isInProgress: true // Assume loading initially
});
CurrentUserContext.displayName = "CurrentUserContext";

export const CurrentUserProvider = ({ children }) => {
  const api = useAPI();
  const [user, setUser] = useState(undefined);
  const [isInProgress, setIsInProgress] = useState(true);

  const fetchUserDetails = useCallback(async () => {
    setIsInProgress(true);
    try {
      const userData = await api.callApi("me");

      if (userData) {
        setUser(userData);
        const isStaffValue =
          userData.is_staff !== undefined
            ? !!userData.is_staff
            : !!userData.isStaff;

        try {
          localStorage.setItem(
            LOCALSTORAGE_IS_STAFF_KEY,
            JSON.stringify(isStaffValue)
          );
          console.log(
            `[CurrentUserProvider] isStaff (${isStaffValue}) set in localStorage.`
          );
        } catch (e) {
          console.error(
            "[CurrentUserProvider] Failed to save isStaff to localStorage:",
            e
          );
        }
      } else {
        setUser(null);
        localStorage.removeItem(LOCALSTORAGE_IS_STAFF_KEY);
        console.log(
          "[CurrentUserProvider] No user data received, isStaff removed from localStorage."
        );
      }
    } catch (error) {
      console.error(
        "[CurrentUserProvider] Error fetching current user:",
        error
      );
      setUser(null);
      localStorage.removeItem(LOCALSTORAGE_IS_STAFF_KEY);
    } finally {
      setIsInProgress(false);
    }
  }, [api]);

  useEffect(() => {
    console.log("[CurrentUserProvider] Initial fetch of user details.");
    fetchUserDetails();
  }, [fetchUserDetails]);

  const contextValue = useMemo(
    () => ({
      user,
      fetch: fetchUserDetails,
      isInProgress
    }),
    [user, fetchUserDetails, isInProgress]
  );

  return (
    <CurrentUserContext.Provider value={contextValue}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUser = () => {
  const context = useContext(CurrentUserContext);
  // To ensure a consistent return type if context could somehow be undefined.
  if (context === undefined) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return context;
};

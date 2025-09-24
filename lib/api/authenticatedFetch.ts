import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// Define a type for the fetch options, including headers
type AuthFetchOptions = RequestInit & {
  headers?: Record<string, string>;
};

export const authenticatedFetch = async (
  url: string,
  router: AppRouterInstance,
  options: AuthFetchOptions = {}
) => {
  const token = localStorage.getItem("token");

  // If no token is found, we can't make an authenticated request
  if (!token) {
    console.warn("No token found. Redirecting to login.");
    router.push("/login");
    throw new Error("No authentication token found.");
  }

  // Add the Authorization header to the request
  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Check for a 401 Unauthorized response from the server
    if (response.status === 401) {
      console.warn("Session expired. Redirecting to login.");
      localStorage.removeItem("token");
      router.push("/login");
      throw new Error("Session expired.");
    }

    // If the response is not OK, throw an error
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error("Authenticated fetch error:", error);
    throw error;
  }
};

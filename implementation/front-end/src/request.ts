import { urlencoded } from "express";

const API_URL = process.env.REACT_APP_API_URL as string;

// Get token from localStorage
const getToken = () => localStorage.getItem("token");

// Get headers for requests
const getHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json", // Ensure Content-Type is always set to JSON
    ...(token && { Authorization: `Bearer ${token}` }), // Add Authorization header if token exists
  };
};

// Helper to append query parameters to the URL for GET and DELETE requests
const buildUrlWithParams = (
  endpoint: string,
  params?: Record<string, unknown>
) => {
  const url = new URL(`${API_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
};

// Handle the response and error codes based on the given table
const handleResponse = async (response: Response) => {
  let data: any;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return {}; // If no JSON response, return an empty object
  }

  if (!response.ok || data.code !== 0) {
    // Handle specific error codes
    switch (data.code) {
      case 1001:
        throw new Error("API Not Found");
      case 1002:
        // throw new Error("Login Required");
        // window.location.href = "/?redirect=" + encodeURIComponent(window.location.pathname);
        if (
          window.location.pathname !== "/" &&
          !window.location.pathname.startsWith("/?redirect=")
        ) {
          window.location.href =
            "/?redirect=" + encodeURIComponent(window.location.pathname);
        }
      case 1003:
        throw new Error("Invalid Parameters");
      case 9999:
        throw new Error("Unknown Error");
      default:
        throw new Error(
          data.msg || `Unexpected error occurred: ${response.status}`
        );
    }
  }

  // If everything is fine, return the data
  return data;
};

// GET request with query parameters
export const apiGet = async (
  endpoint: string,
  params?: Record<string, unknown>
) => {
  const url = buildUrlWithParams(endpoint, params);
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include", // Include credentials like cookies
  });

  return handleResponse(response);
};

// POST request with body
export const apiPost = async (
  endpoint: string,
  body: Record<string, unknown>
) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
    credentials: "include", // Include credentials like cookies
  });

  return handleResponse(response);
};

// PUT request with body
export const apiPut = async (
  endpoint: string,
  body: Record<string, unknown>
) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body),
    credentials: "include", // Include credentials like cookies
  });

  return handleResponse(response);
};

// DELETE request with query parameters or body
export const apiDelete = async (
  endpoint: string,
  paramsOrBody?: Record<string, unknown>
) => {
  const url = buildUrlWithParams(endpoint, paramsOrBody);

  const response = await fetch(url, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include", // Include credentials like cookies
  });

  return handleResponse(response);
};

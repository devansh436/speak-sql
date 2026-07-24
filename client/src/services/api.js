import axios from "axios";
import { auth } from "../firebase";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
// console.log(API_BASE_URL);

// Get Firebase ID token for authenticated requests
export const getAuthHeader = async () => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return {};
  }

  const token = await currentUser.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: await getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to get user info" };
  }
};

export const syncCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: await getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to sync user" };
  }
};

export const getUserPermissions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/permissions`, {
      headers: await getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to get permissions" };
  }
};

// Get tables based on user role (no LLM API)
export const getTables = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tables`, {
      headers: await getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to fetch tables" };
  }
};

// Query APIs (require authentication)
export const executeQuery = async (question) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/query`,
      { question },
      { headers: await getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Network error occurred" };
  }
};

export const getSchema = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/schema`, {
      headers: await getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to fetch schema" };
  }
};

export const checkHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Backend is not responding" };
  }
};

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
console.log(API_BASE_URL);

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Authentication APIs for login, registration, and fetching user info
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Login failed" };
  }
};

export const register = async (username, email, password, role = "USER") => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      username,
      email,
      password,
      role,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Registration failed" };
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to get user info" };
  }
};

export const getUserPermissions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/permissions`, {
      headers: getAuthHeader(),
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
      headers: getAuthHeader(),
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
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Network error occurred" };
  }
};

export const getSchema = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/schema`, {
      headers: getAuthHeader(),
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

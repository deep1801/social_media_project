import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: 'https://social-media-project-si7w.onrender.com',
  baseURL: "http://localhost:10000",
});

// Attach token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Log errors clearly in dev
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      error.response?.data || error.message,
    );
    return Promise.reject(error);
  },
);

export default axiosInstance;

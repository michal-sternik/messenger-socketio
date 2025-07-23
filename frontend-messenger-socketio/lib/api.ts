import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

//add auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
import type { AxiosError } from "axios";
//redirect only if not on /auth/login or /auth/register
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (
      error.response &&
      error.response.status === 401 &&
      !window.location.pathname.startsWith("/login") &&
      !window.location.pathname.startsWith("/register")
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login?source=unauthorized";
    }

    return Promise.reject(
      error instanceof Error
        ? error
        : new Error(typeof error === "string" ? error : JSON.stringify(error))
    );
  }
);

export const authApi = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => api.post("/auth/register", data),
  login: (data: { identifier: string; password: string }) =>
    api.post("/auth/login", data),
};

export const conversationApi = {
  getUserConversations: () => api.get("/conversation-participant"),
  getMessages: (conversationId: string, cursor?: string, limit = 20) =>
    api.get(`/message/${conversationId}/cursor`, { params: { cursor, limit } }),
  deleteConversation: async (conversationId: string) => {
    return api.delete(`/conversation/${conversationId}`);
  },
};

export const userApi = {
  searchUsers: async (searchPhrase: string) => {
    const response = await api.get(`/user/search`, {
      params: { searchPhrase },
    });
    return response;
  },
  getCurrentUser: async () => {
    const response = await api.get(`/user`);
    return response;
  },
};

export default api;

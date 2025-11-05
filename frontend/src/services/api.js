import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// Register API call
export const register = (data) => API.post('/auth/register', data);

// Login API call
export const login = (data) => API.post('/auth/login', data);

// Update profile API call
export const updateProfile = (data, token) =>
  API.patch(`/user/profile/update/${data.username}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

// Forgot Password API call
export const forgotPassword = async (data) => {
  const res = await API.post('/user/profile/forgot-password', data);
  return res.data;
};

// Reset Password API call
export const resetPassword = async (token, data, type = 'JWT') => {
  if (!token) throw new Error('No token provided');

  let url = '/user/profile/reset-password';
  const config = { headers: { 'Content-Type': 'application/json' } };

  if (type === 'JWT') {
    // Logged-in user: send JWT in Authorization header
    config.headers.Authorization = `Bearer ${token}`;
  } else if (type === 'EMAIL') {
    // Email reset token: send as query param
    url += `?token=${token}`;
  }

  const res = await API.patch(url, data, config);
  return res.data;
};

// ---- Products ----
export const getProducts = async ({ page = 1, category, q } = {}) => {
  // Compose query params (add others later if needed)
  const params = new URLSearchParams();
  params.set("page", page);
  if (category) params.set("category", category); // if backend supports it
  if (q) params.set("q", q);

  const res = await API.get(`/products?${params.toString()}`);
  return res.data; // expected shape: { success, products, page, totalPages, totalItems, ... }
};

// Submit quiz API call
export const submitQuiz = (answers, token) =>
  API.post('/quiz/submit', answers, {
    headers: { Authorization: `Bearer ${token}` },
  });

export default API;

// ---------------- SELLER API ----------------

// Fetch seller's products
export const getSellerProducts = (token) =>
  API.get("/products", {
    headers: { Authorization: `Bearer ${token}` },
  });

// Fetch seller's orders
export const getSellerOrders = (token) =>
  API.get("/products", {
    headers: { Authorization: `Bearer ${token}` },
  });

// Fetch seller's dashboard stats
export const getSellerStats = (token) =>
  API.get("/products", {
    headers: { Authorization: `Bearer ${token}` },
  });

// Create a new product
export const createProduct = (payload, token) =>
  API.post("/products", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

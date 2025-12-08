import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data;
    const normalized = {
      message: data?.error?.message || data?.message || err.message || 'Request failed',
      code: data?.error?.errorCode || err.code,
      status: err.response?.status,
      raw: data,
    };
    return Promise.reject(normalized);
  }
);

export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const updateProfile = (data, token) =>
  API.patch(`/user/profile/update/${data.username}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
export const forgotPassword = async (data) => {
  const res = await API.post('/user/profile/forgot-password', data);
  return res.data;
};
export const resetPassword = async (token, data, type = 'JWT') => {
  if (!token) throw new Error('No token provided');
  let url = '/user/profile/reset-password';
  const config = { headers: { 'Content-Type': 'application/json' } };
  if (type === 'JWT') {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (type === 'EMAIL') {
    url += `?token=${token}`;
  }
  const res = await API.patch(url, data, config);
  return res.data;
};

// ---- Products ----
export const getProducts = async ({ page = 1, category, q, token } = {}) => {
  const params = new URLSearchParams();
  params.set('page', page);
  if (category) params.set('category', category);
  if (q) params.set('q', q);
  const res = await API.get(`/products?${params.toString()}` , {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data;
};

export const submitQuiz = (answers, token) =>
  API.post('/quiz/submit', answers, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getSellerProducts = (token) =>
  API.get('/products', {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getSellerOrders = (username, token) =>
  API.get(`/orders/${username}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getSellerStats = async (token) => {
  const res = await API.get('/products', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const products = Array.isArray(res.data?.products) ? res.data.products : [];
  const total = products.length;
  const byCategory = products.reduce((acc, p) => {
    const c = String(p.category || 'UNCATEGORIZED');
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});
  return { totalProducts: total, byCategory };
};
export const createProduct = (payload, token) =>
  API.post('/products', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getProductById = (id, token) =>
  API.get('/products/getProduct', {
    params: { productId: id },
    headers: { Authorization: `Bearer ${token}` },
  });
export const updateProduct = (id, data, token) =>
  API.patch('/products/updateProduct', data, {
    params: { productId: id },
    headers: { Authorization: `Bearer ${token}` },
  });

export const viewCart = (username, token) =>
  API.get(`/cart/view/${username}`, { headers: { Authorization: `Bearer ${token}` } });
export const updateCartItems = (username, items, token) =>
  API.patch(`/cart/update/${username}`, { items }, { headers: { Authorization: `Bearer ${token}` } });
export const addToCart = (username, productId, quantity = 1, token) =>
  updateCartItems(username, [{ productId, quantity }], token);

export const viewWishlist = (username, token) =>
  API.get(`/user/wishlist/view/${username}`, { headers: { Authorization: `Bearer ${token}` } });
export const addToWishlist = (username, productId, token) =>
  API.post(`/user/wishlist/add/${username}`, { productId }, { headers: { Authorization: `Bearer ${token}` } });
export const removeFromWishlist = (username, productId, token) =>
  API.delete(`/user/wishlist/remove/${username}`, { data: { productId }, headers: { Authorization: `Bearer ${token}` } });
export const moveWishlistToCart = (username, productId, token) =>
  API.post(`/user/wishlist/move-to-cart/${username}`, { productId }, { headers: { Authorization: `Bearer ${token}` } });

export const getAddresses = async (username, token) => {
  try {
    const res = await API.get(`/user/address/${username}`, { headers: { Authorization: `Bearer ${token}` } });
    return res.data || [];
  } catch (e) {
    if (e.status === 404) return [];
    return [];
  }
};
export const addAddress = (username, payload, token) =>
  API.post(`/user/address/${username}`, payload, { headers: { Authorization: `Bearer ${token}` } });
export const deleteAddress = (username, addressId, token) =>
  API.delete(`/user/address/${username}/${addressId}`, { headers: { Authorization: `Bearer ${token}` } });

// Checkout requires shippingAddressId, billingAddressId, shippingMethod, and backend expects userName (camel case)
export const checkout = (username, addressId, token, shippingMethod = 'STANDARD') =>
  API.post('/checkout', {
    userName: username,
    shippingAddressId: addressId,
    billingAddressId: addressId, // using same address for billing by default
    shippingMethod,
  }, { headers: { Authorization: `Bearer ${token}` } });

export const getOrders = (username, token) =>
  API.get(`/orders/${username}`, { headers: { Authorization: `Bearer ${token}` } });
export const cancelOrder = (username, orderId, token) =>
  API.patch(`/orders/${username}/${orderId}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
export const returnOrder = (username, orderId, token) =>
  API.patch(`/orders/${username}/${orderId}/return`, {}, { headers: { Authorization: `Bearer ${token}` } });

export default API;

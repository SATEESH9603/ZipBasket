// utils/authRoute.js
export const pickRole = (user) =>
  (user?.role ?? (Array.isArray(user?.roles) ? user.roles[0] : 'USER'))
    .toString()
    .toUpperCase();

export const routeForRole = (role) => {
  const map = {
    ADMIN:  '/admin-dashboard',
    SELLER: '/seller-dashboard',
    USER:   '/user-dashboard',
  };
  return map[role] || '/user-dashboard';
};

// Do everything at once: store, notify parent, and navigate.
export const routeAfterLogin = (navigate, data, onAuth) => {
  // persist (optional)
  localStorage.setItem('auth_token', data.token);
  localStorage.setItem('auth_user', JSON.stringify(data.user));

  // notify your app state (optional)
  onAuth?.(data.token, data.user);

  // route by role
  const role = pickRole(data.user);
  const to = routeForRole(role);
  navigate(to, { replace: true, state: { token: data.token, user: data.user } });
};

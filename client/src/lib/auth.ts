export const getToken = (): string | null => {
  return localStorage.getItem('cybershield_admin_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('cybershield_admin_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('cybershield_admin_token');
};

export const isAdmin = (): boolean => {
  return !!getToken();
};

export const getUserToken = (): string | null => {
  return localStorage.getItem('cybershield_user_token');
};

export const isUserLoggedIn = (): boolean => {
  return !!getUserToken();
};

export const getUserName = (): string => {
  return localStorage.getItem('cybershield_user_name') || 'John Doe';
};

export const removeUserAuth = (): void => {
  localStorage.removeItem('cybershield_user_token');
  localStorage.removeItem('cybershield_user_name');
};

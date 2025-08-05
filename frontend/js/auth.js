export const saveToken  = t => localStorage.setItem('token', t);
export const getToken   = () => localStorage.getItem('token');
export const clearToken = () => localStorage.removeItem('token');
export const authHeader = () => ({ 'Authorization': `Bearer ${getToken()}` });

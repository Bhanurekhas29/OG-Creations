import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from '../api.js';
import { applyFavicon } from '../../shared/favicon.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const DEFAULT_BRANDING = { site_name: 'OG Creations', header_logo: '/images/logo.svg' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());
  const [branding, setBranding] = useState(DEFAULT_BRANDING);

  const loadBranding = useCallback(() => {
    api('public/site')
      .then((r) => {
        setBranding({ ...DEFAULT_BRANDING, ...r.data });
        applyFavicon(r.data.favicon);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadBranding();
    if (!getToken()) return;
    api('auth/me')
      .then((r) => setUser(r.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, [loadBranding]);

  const login = async (identifier, password) => {
    const r = await api('auth/login', { method: 'POST', body: { identifier, password } });
    setToken(r.token);
    setUser(r.user);
  };

  const logout = async () => {
    try {
      await api('auth/logout', { method: 'POST' });
    } catch {
      /* token may already be invalid */
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, branding, loadBranding }}>
      {children}
    </AuthContext.Provider>
  );
}

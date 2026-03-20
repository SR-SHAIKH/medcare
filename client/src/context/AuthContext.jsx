import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('medcare_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Verify session on app load
    useEffect(() => {
        const verifySession = async () => {
            const savedToken = localStorage.getItem('token');
            if (!savedToken) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${savedToken}` }
                });
                const data = await res.json();
                if (data.success) {
                    setUser(data.data);
                    setToken(savedToken);
                    localStorage.setItem('medcare_user', JSON.stringify(data.data));
                } else {
                    // Token invalid — clear session
                    setUser(null);
                    setToken(null);
                    localStorage.removeItem('medcare_user');
                    localStorage.removeItem('token');
                }
            } catch {
                // Server unreachable — keep cached user
            }
            setLoading(false);
        };
        verifySession();
    }, []);

    useEffect(() => {
        if (user) {
            localStorage.setItem('medcare_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('medcare_user');
        }
    }, [user]);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    const login = useCallback((userData, userToken) => {
        setUser(userData);
        setToken(userToken);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
    }, []);

    const getDashboardPath = useCallback((role) => {
        const checkRole = role || user?.role;
        if (!checkRole) return '/login';
        switch (checkRole) {
            case 'doctor': return '/doctor-panel';
            case 'admin': return '/admin';
            default: return '/dashboard';
        }
    }, [user?.role]);

    // Helper for authenticated API calls
    const authFetch = useCallback(async (url, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        return fetch(url, { ...options, headers });
    }, [token]);

    const value = useMemo(() => ({
        user, token, loading, login, logout, getDashboardPath, authFetch
    }), [user, token, loading, login, logout, getDashboardPath, authFetch]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

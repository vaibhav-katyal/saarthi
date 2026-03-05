import { useState, useEffect, useCallback } from "react";

interface User {
    name: string;
    email: string;
    _id?: string;
    avatar?: string | null;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const token = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            if (token && storedUser) {
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            }
        } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
        window.location.href = "/";
    }, []);

    return { user, isAuthenticated, loading, logout };
}

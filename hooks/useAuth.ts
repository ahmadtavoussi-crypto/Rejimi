import { useState, useCallback } from 'react';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

    const login = useCallback(() => {
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(() => {
        setIsAuthenticated(false);
    }, []);
    
    // AdminPanel may still expect this prop if not fully removed, so we provide a dummy function.
    const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
        console.warn("Password change functionality has been removed.");
        // Does nothing as password auth is removed.
        return Promise.resolve();
    }, []);

    return { isAuthenticated, login, logout, changePassword };
};
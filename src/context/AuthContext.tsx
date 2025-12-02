import React, { createContext, useContext, useState, useEffect } from "react";

// Exportar la interfaz User para que otros archivos la usen
export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Verificar si hay sesión guardada
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = async (email: string, password: string) => {
        // Simular login (aquí iría tu API real)
        const userData: User = {
            id: `user_${Date.now()}`, // Generar ID único
            email,
            name: email.split("@")[0],
        };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    const register = async (data: any) => {
        // Simular registro (aquí iría tu API real)
        const userData: User = {
            id: `user_${Date.now()}`, // Generar ID único
            email: data.email,
            name: data.name,
            phone: data.phone,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de AuthProvider");
    }
    return context;
};

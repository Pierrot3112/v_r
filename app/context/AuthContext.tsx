import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../config/AxiosConfig";
import { navigationRef } from "../config/AxiosConfig";

const TOKEN_KEY = "auth_token";

interface AuthState {
  token: string | null;
  authenticated: boolean | null;
}

interface AuthContextProps {
  authState: AuthState;
  onRegister: (nom: string, num_tel: string, password: string) => Promise<RegisterResponse>;
  onLogin: (num_tel: string, password: string) => Promise<LoginResponse>;
  onLogout: () => Promise<void>;
  isLoading: boolean;
}

interface RegisterResponse {
  error: boolean;
  msg: string;
  token?: string;
}

interface LoginResponse {
  error: boolean;
  msg: string;
  token?: string;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    authenticated: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setAuthState({
            token,
            authenticated: true,
          });
        }
      } catch (error) {
        console.error("Failed to load token", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  const onRegister = async (nom: string, num_tel: string, password: string): Promise<RegisterResponse> => {
    try {
      const normalizedNumTel = num_tel.replace(/\s+/g, '').replace(/^\+/, '');

      const response = await api.post("/signup", {
        nom,
        num_tel: normalizedNumTel,
        password,
      });

      if (response.data.access_token) {
        await AsyncStorage.setItem(TOKEN_KEY, response.data.access_token);
        
        setAuthState({
          token: response.data.access_token,
          authenticated: true,
        });

        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;

        return {
          error: false,
          msg: "Inscription réussie! Vous êtes maintenant connecté.",
          token: response.data.access_token,
        };
      }

      return {
        error: false,
        msg: "Inscription réussie! Vous pouvez maintenant vous connecter.",
      };
    } catch (error: any) {
      console.error("Registration error:", error.response?.data);
      
      let errorMessage = "Échec de l'inscription";
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || "Données invalides";
        } else if (error.response.status === 409) {
          errorMessage = "Ce numéro de téléphone est déjà utilisé";
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      }

      return {
        error: true,
        msg: errorMessage,
      };
    }
  };

  const onLogin = async (num_tel: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post("/auth/login", {
        num_tel,
        password,
      });

      await AsyncStorage.setItem(TOKEN_KEY, response.data.access_token);
      
      setAuthState({
        token: response.data.access_token,
        authenticated: true,
      });

      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;

      return {
        error: false,
        msg: "Connexion réussie",
        token: response.data.access_token,
      };
    } catch (error: any) {
      let errorMessage = "Échec de la connexion";
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Numéro ou mot de passe incorrect";
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      }

      return {
        error: true,
        msg: errorMessage,
      };
    }
  };

  const onLogout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    
    setAuthState({
      token: null,
      authenticated: false,
    });

    delete api.defaults.headers.common['Authorization'];

    if (navigationRef.isReady()) {
      navigationRef.navigate("Login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        onRegister,
        onLogin,
        onLogout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
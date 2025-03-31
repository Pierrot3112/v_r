import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../config/AxiosConfig";
import { navigationRef } from "../config/AxiosConfig";

export const TOKEN_KEY = "auth_token";

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
  checkToken: () => Promise<string | null>;
  getRole: (token: string) => Promise<string>;
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
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({ 
    token: null, 
    authenticated: null 
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
            authenticated: true 
          });
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const onRegister = async (
    nom: string, 
    num_tel: string, 
    password: string
  ): Promise<RegisterResponse> => {
    try {
      const response = await api.post("/signup", { nom, num_tel, password });
  
      if (response.data) {
        return { error: false, msg: "Inscription réussie!" };
      }
  
      return { error: true, msg: "Réponse inattendue du serveur" };
  
    } catch (error: any) {
      let errorMessage = "Le numéro que vous avez saisi est déjà inscrit, veuillez saisissez un autre.";
  
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = "Numéro déjà inscrit.";
        } else if (error.response.status === 409) {
          errorMessage = "Numéro déjà inscrit.";
        } else if (error.response.data && error.response.data.msg) {
          errorMessage = error.response.data.msg;
        }
      } else if (error.request) {
        errorMessage = "Impossible de contacter le serveur. Vérifiez votre connexion.";
      } 
      return { error: true, msg: errorMessage };
    }
  };
  
  

  const onLogin = async (
    num_tel: string, 
    password: string
  ): Promise<LoginResponse> => {
    try {
      const response = await api.post("/token", { 
        num_tel, 
        password 
      });
      await AsyncStorage.setItem(TOKEN_KEY, response.data.access_token);
      setAuthState({ 
        token: response.data.access_token, 
        authenticated: true 
      });
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      return { 
        error: false, 
        msg: "Connexion réussie", 
        token: response.data.access_token 
      };
    } catch (error: unknown) {
      let errorMessage = "Numéro ou mot de passe incorrect";
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        if (axiosError.response?.data?.detail) {
          errorMessage = axiosError.response.data.detail;
        }
      }
      return { 
        error: true, 
        msg: errorMessage 
      };
    }
  };

  const onLogout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setAuthState({ 
      token: null, 
      authenticated: false 
    });
    delete api.defaults.headers.common['Authorization'];
    if (navigationRef.isReady()) {
      navigationRef.navigate('/(auth)/login');
    }
  };

  const checkToken = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  };

  const getRole = async (token: string): Promise<string> => {
    try {
      const response = await api.get("/me", { 
        headers: { 
          Authorization: `Bearer ${token}` 
        } 
      });
      return response.data.role || "user";
    } catch {
      return "user";
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
        checkToken, 
        getRole 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
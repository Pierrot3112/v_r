import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createNavigationContainerRef } from "@react-navigation/native";
import { TOKEN_KEY } from "../context/AuthContext";
import NetInfo from "@react-native-community/netinfo";
import { Snackbar } from "react-native-paper";
import { View } from "react-native";
import { useState } from "react";
import { ReactNode } from "react";

export const navigationRef = createNavigationContainerRef();

export const BASE_API_URL = "https://api-v1-cec7.onrender.com/";

interface ApiErrorHandlerProps {
  children: ReactNode;
}

const GlobalUtils = {
  showSnackbar: (message: string, type: string = "error") => {},
};

const ApiErrorHandler = ({ children }: ApiErrorHandlerProps) => {
  const [visible, setVisible] = useState(false);
  const [snackbarData, setSnackbarData] = useState({
    message: "",
    type: "default",
  });

  const showError = (message: string, type: string = "error") => {
    setSnackbarData({ message, type });
    setVisible(true);
  };

  GlobalUtils.showSnackbar = showError;

  return (
    <View style={{ flex: 1 }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        action={{ label: "OK", onPress: () => setVisible(false) }}
        style={{
          backgroundColor:
            snackbarData.type === "error" ? "#fe020287" : "#00050ca4",
        }}
      >
        {snackbarData.message}
      </Snackbar>
    </View>
  );
};

const checkInternetConnection = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
};

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

const AUTH_ENDPOINTS = ['/token', '/signup', '/forgot-password'];

const isAuthEndpoint = (url: string = '') => {
  return AUTH_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

api.interceptors.request.use(
  async (config) => {
    const isConnected = await checkInternetConnection();

    if (!isConnected) {
      if (config._handleError !== false) {
        GlobalUtils.showSnackbar(
          "Pas de connexion Internet. Veuillez vérifier votre connexion.",
          "error"
        );
      }
      return Promise.reject(new Error("Pas de connexion Internet"));
    }

    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (!isAuthEndpoint(config.url) && navigationRef.isReady()) {
        navigationRef.navigate("/(auth)/login");
      }
    } catch (err) {
      if (!isAuthEndpoint(config.url) && navigationRef.isReady()) {
        navigationRef.navigate("/(auth)/login");
      }
    }

    return config;
  },
  (error) => {
    if (error.config?._handleError !== false) {
      GlobalUtils.showSnackbar(
        "Erreur lors de la préparation de la requête",
        "error"
      );
    }
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    const isAuthRequest = isAuthEndpoint(config?.url);

    if (config?._handleError === false) {
      return Promise.reject(error);
    }

    if (!response) {
      const message = error.code === "ECONNABORTED" 
        ? "La requête a expiré. Veuillez réessayer."
        : "Erreur de connexion. Vérifiez votre Internet.";
      
      if (!isAuthRequest || config?._handleError === undefined) {
        GlobalUtils.showSnackbar(message, "error");
      }
      return Promise.reject(new Error(message));
    }

    const { status, data } = response;
    let errorMessage = data?.detail || data?.message || "Une erreur est survenue";

    if (isAuthRequest) {
      switch (status) {
        case 400:
          errorMessage = data?.msg || "Requête invalide";
          break;
        case 401:
          errorMessage = data?.detail?.includes("incorrect") 
            ? "Identifiants incorrects. Veuillez réessayer."
            : "Session expirée. Veuillez vous reconnecter.";
          break;
        case 403:
          errorMessage = "Accès refusé. Permissions insuffisantes.";
          break;
        default:
          errorMessage = "Erreur lors de l'authentification";
      }
    } else {
      switch (status) {
        case 400:
          errorMessage = "Requête invalide";
          break;
        case 401:
          errorMessage = "Session expirée. Veuillez vous reconnecter.";
          break;
        case 403:
          errorMessage = "Accès refusé. Permissions insuffisantes.";
          break;
        case 404:
          errorMessage = "Ressource introuvable";
          break;
        case 500:
          errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
          break;
      }
    }

    if (!isAuthRequest || config?._handleError === undefined) {
      GlobalUtils.showSnackbar(errorMessage, "error");
    }

    if (status === 401 && !isAuthRequest) {
      try {
        await AsyncStorage.removeItem(TOKEN_KEY);
        if (navigationRef.isReady()) {
          navigationRef.navigate("/(auth)/login");
        }
      } catch {}
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default api;

export { ApiErrorHandler as ErrorHandler, GlobalUtils };

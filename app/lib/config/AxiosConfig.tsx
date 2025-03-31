import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createNavigationContainerRef } from "@react-navigation/native";
import { TOKEN_KEY } from "../context/AuthContext";
import NetInfo from "@react-native-community/netinfo";
import { Snackbar } from "react-native-paper";
import { View } from "react-native";
import { useState } from "react";
import { ReactNode } from "react";

interface ApiErrorHandlerProps {
  children: ReactNode;
}


export const GlobalUtils = {
  showSnackbar: (message: string, type: string = "error") => {},
};

export const BASE_API_URL = "https://api-v1-cec7.onrender.com/";
export const navigationRef = createNavigationContainerRef();

export const ApiErrorHandler =  ({ children }: ApiErrorHandlerProps)  => {
  const [visible, setVisible] = useState(false);
  const [snackbarData, setSnackbarData] = useState({
    message: "",
    type: "default",
  });

  const showError = (message: string, type: string = "error") => {
    setSnackbarData({ message, type });
    setVisible(true);
  };

  // On stocke la fonction dans GlobalUtils au lieu de globalThis
  GlobalUtils.showSnackbar = showError;

  return (
    <View style={{ flex: 1 }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => setVisible(false),
        }}
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

api.interceptors.request.use(
  async (config) => {
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      GlobalUtils.showSnackbar(
        "Pas de connexion Internet. Veuillez vérifier votre connexion.",
        "error"
      );
      return Promise.reject(new Error("Pas de connexion Internet"));
    }

    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (navigationRef.isReady()) {
        navigationRef.navigate("/(auth)/login");
      }
      return config;
    } catch (error) {
      if (navigationRef.isReady()) {
        navigationRef.navigate("/(auth)/login");
      }
      return Promise.reject(error);
    }
  },
  (error) => {
    GlobalUtils.showSnackbar(
      "Une erreur est survenue lors de la préparation de la requête",
      "error"
    );
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === "ECONNABORTED") {
      GlobalUtils.showSnackbar(
        "La requête a pris trop de temps. Veuillez réessayer.",
        "error"
      );
      return Promise.reject(new Error("La requête a expiré"));
    }

    if (!error.response) {
      GlobalUtils.showSnackbar(
        "Erreur de connexion. Vérifiez votre connexion Internet.",
        "error"
      );
      return Promise.reject(new Error("Problème de connexion"));
    }

    const { status, data } = error.response;
    let errorMessage = data?.message || data?.detail || "Une erreur est survenue";

    switch (status) {
      case 400:
        GlobalUtils.showSnackbar(`Requête invalide: ${errorMessage}`, "error");
        break;
      case 401:
        if (errorMessage.toLowerCase().includes("incorrect")) {
          GlobalUtils.showSnackbar(
            "Identifiants incorrects. Veuillez réessayer.",
            "error"
          );
        } else {
          GlobalUtils.showSnackbar(
            "Session expirée. Veuillez vous reconnecter.",
            "error"
          );
        }
        try {
          await AsyncStorage.removeItem(TOKEN_KEY);
          if (navigationRef.isReady()) {
            navigationRef.navigate("/(auth)/login");
          }
        } catch (storageError) {
          console.error("Failed to remove token:", storageError);
        }
        break;
      case 403:
        GlobalUtils.showSnackbar(
          "Accès refusé. Permissions insuffisantes.",
          "error"
        );
        break;
      case 404:
        GlobalUtils.showSnackbar("Ressource introuvable", "error");
        break;
      case 500:
        GlobalUtils.showSnackbar(
          "Erreur serveur. Veuillez réessayer plus tard.",
          "error"
        );
        break;
      default:
        GlobalUtils.showSnackbar(`Erreur ${status}: ${errorMessage}`, "error");
        break;
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default api;

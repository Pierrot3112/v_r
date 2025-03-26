import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_API_URL as URL } from "../utils/base.api.url";
import NetInfo from "@react-native-community/netinfo";
import { createNavigationContainerRef } from "@react-navigation/native";
import { Snackbar } from "react-native-paper";

// Ajouter après les imports et avant la création du Snackbar global
export const navigationRef = createNavigationContainerRef();

// Création d'une instance Snackbar globale
let globalSnackbar: {
  show: (message: string, type?: 'error' | 'info' | 'success') => void;
} = {
  show: () => {},
};

// Fonction pour initialiser le Snackbar
export const setGlobalSnackbar = (snackbar: any) => {
  globalSnackbar = snackbar;
};

const api = axios.create({
    baseURL: URL,
    headers: { "Content-Type": "application/json" },
});

const checkInternetConnection = async () => {
    const state = await NetInfo.fetch();
    return state.isConnected;
};

api.interceptors.request.use(
    async (config) => {
        const isConnected = await checkInternetConnection();
        if (!isConnected) {
            globalSnackbar.show(
                "Pas de connexion Internet. Veuillez vérifier votre connexion.",
                'error'
            );
            return Promise.reject(new Error("Pas de connexion Internet"));
        }

        try {
            const token = await AsyncStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else if (navigationRef.isReady()) {
                navigationRef.navigate("Login");
            }
        } catch (error) {
            if (navigationRef.isReady()) {
                navigationRef.navigate("Login");
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            globalSnackbar.show(
                "Erreur de connexion. Vérifiez votre connexion Internet.",
                'error'
            );
            return Promise.reject(error);
        }

        const { status, data } = error.response;
        let errorMessage = data?.detail || "Une erreur est survenue.";
        let snackbarType: 'error' | 'info' = 'error';

        switch (status) {
            case 400:
                errorMessage = `Requête invalide : ${errorMessage}`;
                break;
            case 401:
                if (errorMessage === 'Une erreur interne est survenue') {
                    errorMessage = 'Numéro ou mot de passe incorrect. Veuillez réessayer.';
                } else {
                    errorMessage = 'Accès non autorisé. Veuillez réessayer.';
                }
                if (navigationRef.isReady()) navigationRef.navigate("Login");
                break;
            case 403:
                errorMessage = "Accès interdit. Permissions insuffisantes.";
                break;
            case 404:
                errorMessage = "Ressource introuvable";
                break;
            case 500:
                errorMessage = "Erreur serveur. Réessayez plus tard.";
                break;
            default:
                errorMessage = `Erreur ${status} : ${errorMessage}`;
                break;
        }

        globalSnackbar.show(errorMessage, snackbarType);
        return Promise.reject(error);
    }
);

export default api;
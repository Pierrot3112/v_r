import React, { useState, useEffect } from 'react';
import { 
    StyleSheet, View, Dimensions, KeyboardAvoidingView, Platform 
} from 'react-native';
import { 
    TextInput, Button, Text, Snackbar, 
    TouchableRipple, useTheme 
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/config/AxiosConfig';
import { router } from 'expo-router';
import { COLORS } from '../lib/constants';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  ValidCodeOtp: { phoneNumber: string };
  login: undefined;
  Register: undefined;
};

const ValidCodeOtp = () => {
    const theme = useTheme();
    const route = useRoute<RouteProp<RootStackParamList, 'ValidCodeOtp'>>(); 
    const { phoneNumber } = route.params;

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarType, setSnackbarType] = useState<'error' | 'success'>('error');

    const showSnackbar = (message: string, type: 'error' | 'success' = 'error') => {
        setSnackbarMessage(message);
        setSnackbarType(type);
        setSnackbarVisible(true);
    };

    useEffect(() => {
        const checkResendTime = async () => {
            try {
                const lastResendTime = await AsyncStorage.getItem('lastResendTime');
                if (lastResendTime) {
                    const now = Date.now();
                    const timeElapsed = now - parseInt(lastResendTime, 10);

                    if (timeElapsed < 5 * 60 * 1000) {
                        setResendDisabled(true);
                        setTimeLeft(Math.floor((5 * 60 * 1000 - timeElapsed) / 1000));
                    }
                }
            } catch (error) {
                // Gestion silencieuse de l'erreur
            }
        };

        checkResendTime();
    }, []);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setResendDisabled(false);
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft]);

    const handleSubmitOtp = async () => {
        if (otp.length !== 6) {
            showSnackbar('Veuillez saisir les 6 chiffres du code', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/verify', { 
                num_tel: phoneNumber, 
                code: otp 
            });

            if (response.data) {
                showSnackbar('Votre compte a été validé!', 'success');
                setTimeout(() => router.replace('/login'), 2000);
            } else {
                showSnackbar('Code invalide', 'error');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message ?? 'Erreur de validation';
            showSnackbar(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendDisabled) return;

        setLoading(true);
        try {
            await api.post('/resend-code', { num_tel: phoneNumber });

            const now = Date.now();
            await AsyncStorage.setItem('lastResendTime', now.toString());

            setTimeLeft(5 * 60);
            setResendDisabled(true);
            showSnackbar('Code OTP renvoyé', 'success');
        } catch (error) {
            showSnackbar('Erreur lors de l\'envoi du code', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.global, { backgroundColor: theme.colors.background }]}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableRipple 
                        onPress={() => router.back()} 
                        style={styles.backButton}
                        borderless
                    >
                        <Ionicons name='arrow-back' size={24} color={theme.colors.primary} />
                    </TouchableRipple>
                    <Text variant="headlineMedium" style={styles.title}>
                        Saisir le code reçu par SMS
                    </Text>
                    <Text variant="bodyMedium" style={styles.subTitle}>
                        Envoyé au {phoneNumber}
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <TextInput
                        mode="outlined"
                        placeholder="Entrez le code de validation"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="numeric"
                        maxLength={6}
                        textColor={COLORS.primary}
                        style={styles.codeInput}
                        autoFocus
                        theme={{
                            colors: {
                                primary: theme.colors.primary,
                                placeholder: theme.colors.onSurfaceDisabled,
                            }
                        }}
                    />

                    <Button
                        mode="contained"
                        onPress={handleSubmitOtp}
                        style={styles.btnCodeValid}
                        loading={loading}
                        disabled={loading}
                        labelStyle={styles.btnText}
                    >
                        Valider le code
                    </Button>

                    <View style={styles.resendContainer}>
                        <Text style={styles.text}>
                            Vous n'avez pas reçu de code? 
                        </Text>
                        <Button
                            mode="text"
                            onPress={handleResendOtp}
                            disabled={resendDisabled || loading}
                            labelStyle={styles.resendText}
                        >
                            {resendDisabled ? `Renvoyer (${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')})` : 'Renvoyer le code'}
                        </Button>
                    </View>
                </View>

                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                    style={{
                        backgroundColor: snackbarType === 'error' 
                            ? COLORS.red 
                            : COLORS.green
                    }}
                    action={{
                        label: 'OK',
                        onPress: () => setSnackbarVisible(false),
                    }}
                >
                    {snackbarMessage}
                </Snackbar>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    global: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: width * 0.05,
    },
    header: {
        marginTop: height * 0.1,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: -height * 0.02,
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: height * 0.01,
    },
    subTitle: {
        marginBottom: height * 0.03,
    },
    formContainer: {
        width: '100%',
        padding: width * 0.05,
        borderRadius: 10,
        alignItems: 'center',
    },
    codeInput: {
        width: '100%',
        marginBottom: height * 0.02,
    },
    btnCodeValid: {
        marginTop: height * 0.02,
        width: '100%',
    },
    btnText: {
        fontWeight: 'bold',
    },
    resendContainer: {
        marginTop: height * 0.04,
        alignItems: 'center',
    },
    text: {
        color: '#666',
    },
    resendText: {
        textDecorationLine: "underline",
    },
});

export default ValidCodeOtp;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import {
  Button,
  Text,
  Snackbar,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/config/AxiosConfig';
import { router } from 'expo-router';
import { COLORS } from '../lib/constants';

type RootStackParamList = {
  ValidCodeOtp: {
    phoneNumber: string;
    forceTimer?: boolean;
  };
};

const ValidCodeOtp = () => {
  const theme = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'ValidCodeOtp'>>();
  const { phoneNumber, forceTimer } = route.params;

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'error' | 'success'>('error');

  const hiddenInputRef = useRef<RNTextInput>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showSnackbar = useCallback((message: string, type: 'error' | 'success' = 'error') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  }, []);

  const initializeTimer = useCallback(async () => {
    try {
      if (forceTimer) {
        const now = Date.now();
        await AsyncStorage.setItem('lastResendTime', now.toString());
        setTimeLeft(300);
        setResendDisabled(true);
        return;
      }

      const lastResendTime = await AsyncStorage.getItem('lastResendTime');
      if (lastResendTime) {
        const now = Date.now();
        const elapsed = now - parseInt(lastResendTime, 10);
        const remaining = Math.max(0, 300 - Math.floor(elapsed / 1000));

        if (remaining > 0) {
          setTimeLeft(remaining);
          setResendDisabled(true);
        } else {
          setResendDisabled(false);
        }
      } else {
        setResendDisabled(false);
      }
    } catch (error) {
      console.error('Error initializing timer:', error);
      setResendDisabled(false);
    }
  }, [forceTimer]);

  useEffect(() => {
    initializeTimer();
  }, [initializeTimer]);

  useEffect(() => {
    if (timeLeft > 0 && resendDisabled) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLeft, resendDisabled]);

  const handleSubmitOtp = useCallback(async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      showSnackbar('Veuillez saisir les 6 chiffres du code', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/verify', {
        num_tel: phoneNumber,
        code: otpCode,
      });

      if (response.data) {
        showSnackbar('Votre compte a été validé!', 'success');
        setTimeout(() => {
          router.replace('/login');
        }, 2000);
      } else {
        showSnackbar('Code invalide', 'error');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ?? 'Erreur de validation';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [otp, phoneNumber, showSnackbar]);

  const handleResendOtp = useCallback(async () => {
    if (resendDisabled) return;

    setLoading(true);
    try {
      await api.post('/resend-code', { num_tel: phoneNumber });

      const now = Date.now();
      await AsyncStorage.setItem('lastResendTime', now.toString());
      setTimeLeft(300);
      setResendDisabled(true);
      showSnackbar('Code OTP renvoyé', 'success');
    } catch (error) {
      showSnackbar("Erreur lors de l'envoi du code", 'error');
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, resendDisabled, showSnackbar]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOtpChange = useCallback((text: string) => {
    const filteredText = text.replace(/[^0-9]/g, ''); // Filtrer les caractères non numériques
    const digits = filteredText.split('').slice(0, 6); // Prendre les 6 premiers chiffres
    const paddedDigits = [...digits, ...Array(6 - digits.length).fill('')]; // Compléter pour avoir 6 éléments
    setOtp(paddedDigits);

    // Si 6 chiffres sont saisis, masquer le clavier
    if (digits.length === 6) {
      hiddenInputRef.current?.blur();
      Keyboard.dismiss();
    }
  }, []);

  const handleOtpBoxPress = useCallback(() => {
    hiddenInputRef.current?.focus();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <View style={styles.content}>
        <TouchableRipple onPress={() => router.back()} style={styles.backButton} borderless>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableRipple>

        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
            Saisir le code reçu par SMS
          </Text>
          <Text variant="bodyMedium" style={[styles.subTitle, { color: theme.colors.onSurfaceVariant }]}>
            Envoyé au {phoneNumber}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.otpContainer}>
            {otp.map((value, index) => (
              <TouchableOpacity
                key={index}
                onPress={handleOtpBoxPress}
                style={[styles.otpBox, value && styles.otpBoxFilled]}
              >
                <Text style={styles.otpText}>{value || ''}</Text>
              </TouchableOpacity>
            ))}
            <RNTextInput
              ref={hiddenInputRef}
              value={otp.join('')}
              onChangeText={handleOtpChange}
              maxLength={6}
              keyboardType="number-pad"
              style={styles.hiddenInput}
              autoFocus
              editable
              contextMenuHidden={false}
              autoCorrect={false}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleSubmitOtp}
            style={styles.submitButton}
            loading={loading}
            disabled={loading}
            labelStyle={styles.buttonLabel}
          >
            Valider
          </Button>

          <View style={styles.resendContainer}>
            <Text variant="bodyMedium" style={[styles.resendText, { color: COLORS.yellow }]}>
              Vous n'avez pas reçu de code ?
            </Text>
            <Button
              mode="text"
              onPress={handleResendOtp}
              disabled={resendDisabled || loading}
              labelStyle={[
                styles.resendButtonText,
                { color: resendDisabled ? COLORS.gray2 : COLORS.primary },
              ]}
            >
              {resendDisabled ? `Renvoyer (${formatTime(timeLeft)})` : 'Renvoyer le code'}
            </Button>
          </View>
        </View>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{
          backgroundColor: snackbarType === 'error' ? COLORS.red : COLORS.green,
        }}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgBlue,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    backgroundColor: COLORS.bgBlue,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 40,
    zIndex: 1,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subTitle: {
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  otpBox: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: COLORS.bgBlue,
  },
  otpBoxFilled: {
    backgroundColor: COLORS.bgBlue,
  },
  otpText: {
    fontSize: 20,
    color: COLORS.primary,
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    color: 'transparent',
    opacity: 0,
    zIndex: 1
  },
  submitButton: {
    marginVertical: 16,
    backgroundColor: COLORS.gray,
  },
  buttonLabel: {
    fontWeight: 'bold',
    color: COLORS.primary
  },
  resendContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    marginRight: 10,
  },
  resendButtonText: {
    fontWeight: 'bold',
  },
});

export default ValidCodeOtp;

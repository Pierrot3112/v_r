import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Dimensions,
  Keyboard,
  ActivityIndicator,
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
import { COLORS, SIZES } from '../lib/constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const TOKEN_KEY = 'auth_token';

type RootStackParamList = {
  ValidCodeOtp: {
    phoneNumber: string;
    forceTimer?: string;
  };
};

const ValidCodeOtp: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'ValidCodeOtp'>>();
  const { phoneNumber, forceTimer } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'error' | 'success'>('error');

  const inputRef = useRef<TextInput>(null);

  const showSnackbar = useCallback((message: string, type: 'error' | 'success' = 'error') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  }, []);

  const initializeTimer = useCallback(async () => {
    try {
      if (forceTimer === 'true') {
        const now = Date.now();
        await AsyncStorage.setItem(TOKEN_KEY, now.toString());
        setTimeLeft(300);
        setResendDisabled(true);
        return;
      }
      const lastResendTime = await AsyncStorage.getItem(TOKEN_KEY);
      if (lastResendTime) {
        const now = Date.now();
        const elapsed = now - parseInt(lastResendTime, 10);
        const remaining = Math.max(0, 300 - Math.floor(elapsed / 1000));
        if (remaining > 0) {
          setTimeLeft(remaining);
          setResendDisabled(true);
        } else {
          setTimeLeft(0);
          setResendDisabled(false);
        }
      } else {
        setTimeLeft(0);
        setResendDisabled(false);
      }
    } catch (error) {
      setResendDisabled(false);
    }
  }, [forceTimer]);

  useEffect(() => {
    initializeTimer();
  }, [initializeTimer]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (timeLeft > 0 && resendDisabled) {
      timer = setInterval(() => {
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
      if (timer) clearInterval(timer);
    };
  }, [timeLeft, resendDisabled]);

  const handleSubmitOtp = useCallback(async () => {
    if (otp.length !== 6) {
      showSnackbar('Veuillez saisir les 6 chiffres du code', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/verify', {
        num_tel: phoneNumber,
        code: otp,
      });
      if (response.data) {
        showSnackbar('Votre compte a été validé!', 'success');
        setTimeout(() => {
          router.replace('/login');
        }, 2000);
      } else {
        showSnackbar('Code invalide', 'error');
        setLoading(false);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ?? 'Erreur de validation';
      showSnackbar(errorMessage, 'error');
      setLoading(false);
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
      await AsyncStorage.setItem(TOKEN_KEY, now.toString());
      setTimeLeft(300);
      setResendDisabled(true);
      showSnackbar('Code OTP renvoyé', 'success');
      setLoading(false);
    } catch (error) {
      showSnackbar("Erreur lors de l'envoi du code", 'error');
      setResendDisabled(false);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, resendDisabled, showSnackbar]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleChange = useCallback((text: string) => {
    const filtered = text.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(filtered);
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { height: SCREEN_HEIGHT }]}
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
          <TextInput
            ref={inputRef}
            style={styles.singleInput}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={handleChange}
            autoFocus
          />

          <Button
            mode="contained"
            onPress={handleSubmitOtp}
            style={[
              styles.submitButton,
              { backgroundColor: loading || otp.length !== 6 ? COLORS.gray2 : COLORS.gray }
            ]}
            disabled={loading || otp.length !== 6}
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
              style={[
                styles.resendButton,
                { backgroundColor: resendDisabled ? COLORS.gray2 : COLORS.gray },
              ]}
            >
              {resendDisabled ? `Renvoyer après (${formatTime(timeLeft)})` : 'Renvoyer le code'}
            </Button>

            <View style={{marginTop: 20}}>
              {loading ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <Text> </Text>
              )}
            </View>
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
    flex: 1,
    backgroundColor: COLORS.bgBlue,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
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
  singleInput: {
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: COLORS.primary,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  submitButton: {
    marginVertical: 16,
    borderRadius: 8,
    backgroundColor: COLORS.gray,
  },
  buttonLabel: {
    fontWeight: 'bold',
    color: COLORS.primary,
    fontSize: 18,
  },
  resendContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    marginBottom: 8,
  },
  resendButton: {
    padding: SIZES.medium / 4,
    borderRadius: SIZES.medium / 2,
  },
  otpDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  otpBox: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  otpBoxText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default ValidCodeOtp;

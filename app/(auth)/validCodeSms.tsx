import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  TouchableOpacity,
  Keyboard,
  Clipboard,
  Modal,
  Dimensions,
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

type RootStackParamList = {
  ValidCodeOtp: {
    phoneNumber: string;
    forceTimer?: string;
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
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [clipboardContent, setClipboardContent] = useState('');
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [cursorVisible, setCursorVisible] = useState(true);

  const hiddenInputRef = useRef<RNTextInput>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showSnackbar = useCallback((message: string, type: 'error' | 'success' = 'error') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  }, []);

  const initializeTimer = useCallback(async () => {
    try {
      if (forceTimer === 'true') {
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
      setResendDisabled(false);
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
    const filteredText = text.replace(/[^0-9]/g, '');
    const digits = filteredText.split('').slice(0, 6);
    const paddedDigits = [...digits, ...Array(6 - digits.length).fill('')];
    setOtp(paddedDigits);
    
    const nextEmptyIndex = digits.length < 6 ? digits.length : 5;
    setFocusedIndex(nextEmptyIndex);

    if (digits.length === 6) {
      hiddenInputRef.current?.blur();
      Keyboard.dismiss();
    }
  }, []);

  useEffect(() => {
    let cursorInterval: NodeJS.Timeout | null = null;
    
    if (focusedIndex !== null) {
      cursorInterval = setInterval(() => {
        setCursorVisible(prev => !prev);
      }, 500);
    }
    
    return () => {
      if (cursorInterval) {
        clearInterval(cursorInterval);
      }
      setCursorVisible(true);
    };
  }, [focusedIndex]);

  const handleOtpBoxPress = useCallback(() => {
    hiddenInputRef.current?.focus();
    const activeIndex = otp.findIndex(digit => digit === '');
    setFocusedIndex(activeIndex !== -1 ? activeIndex : otp.length - 1);
  }, [otp]);

  const handleLongPress = useCallback(async () => {
    try {
      const content = await Clipboard.getString();
      setClipboardContent(content);
      
      if (content.replace(/[^0-9]/g, '').length >= 4) {
        setShowPasteModal(true);
      } else {
        showSnackbar('Aucun copie de code trouvé', 'error');
      }
    } catch (error) {
      showSnackbar('Erreur lors de la lecture du presse-papiers', 'error');
    }
  }, [showSnackbar]);

  const handlePaste = useCallback(() => {
    const otpCode = clipboardContent.replace(/[^0-9]/g, '').slice(0, 6);
    if (otpCode.length >= 4) {
      handleOtpChange(otpCode);
    }
    setShowPasteModal(false);
  }, [clipboardContent, handleOtpChange, showSnackbar]);

  const cancelPaste = useCallback(() => {
    setShowPasteModal(false);
  }, []);

  useEffect(() => {
    const handleKeyboardShow = () => {
      const activeIndex = otp.findIndex(digit => digit === '');
      setFocusedIndex(activeIndex !== -1 ? activeIndex : otp.length - 1);
    };

    const handleKeyboardHide = () => {
      setFocusedIndex(null);
    };

    Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
    Keyboard.addListener('keyboardDidHide', handleKeyboardHide);

    return () => {
      Keyboard.removeAllListeners('keyboardDidShow');
      Keyboard.removeAllListeners('keyboardDidHide');
    };
  }, [otp]);

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
        <View style={styles.otpContainer}>
          {Array(6).fill(0).map((_, index) => (
            <OTPBox 
              key={index}
              index={index}
              value={otp[index]}
              focused={focusedIndex === index}
              onPress={handleOtpBoxPress}
            />
          ))}
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
              style={[
                styles.resendButton,
                { backgroundColor: resendDisabled ? COLORS.gray2 : COLORS.gray },
              ]}
            >
              {resendDisabled ? `Renvoyer après (${formatTime(timeLeft)})` : 'Renvoyer le code'}
            </Button>
          </View>
        </View>
      </View>

      <Modal
        visible={showPasteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelPaste}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Coller le code depuis le presse-papiers ?</Text>
            <Text style={styles.clipboardText} numberOfLines={1}>
              {clipboardContent}
            </Text>
            <View style={styles.modalButtons}>
              <Button 
                mode="contained" 
                onPress={cancelPaste}
                style={styles.modalButton}
              >
                Annuler
              </Button>
              <Button 
                mode="contained" 
                onPress={handlePaste}
                style={styles.modalButton}
                color={COLORS.primary}
              >
                Coller
              </Button>
            </View>
          </View>
        </View>
      </Modal>

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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    marginHorizontal: 20,
  },
  otpBox: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    position: 'relative',
  },
  otpBoxFilled: {
    backgroundColor: 'transparent',
  },
  otpBoxFocused: {
    borderColor: COLORS.yellow,
    borderWidth: 2,
  },
  otpText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  cursor: {
    position: 'absolute',
    height: 24,
    width: 2,
    backgroundColor: COLORS.yellow,
    marginLeft: 2,
    bottom: 12,
    opacity: 1,
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
    borderRadius: 8,
    backgroundColor: COLORS.gray,
  },
  buttonLabel: {
    fontWeight: 'bold',
    color: COLORS.primary,
    fontSize: 18,
  },
  buttonContent: {
    height: 48,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  clipboardText: {
    fontSize: 22,
    color: COLORS.gray,
    marginBottom: 5,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default ValidCodeOtp;
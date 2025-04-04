import React, { useState } from 'react';
import { 
  SafeAreaView, 
  View, 
  Dimensions, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StyleSheet 
} from 'react-native';
import { 
  Text, 
  ActivityIndicator, 
  TextInput, 
  Button, 
  IconButton, 
  useTheme, 
  Snackbar 
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import api from '../lib/config/AxiosConfig';
import { COLORS, SIZES } from '../lib/constants';
import { AxiosError } from 'axios';

const { width, height } = Dimensions.get("window");

type ErrorResponse = {
  msg?: string;
  message?: string;
};

type SnackbarState = {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
};

const ForgotPassword = () => {
  const [num_tel, setNumTel] = useState('');
  const [reset_code, setResetCode] = useState('');
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [codeSent, setCodeSent] = useState(false);
  const [new_password, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    visible: false,
    message: '',
    type: 'success'
  });

  const navigation = useNavigation();
  const theme = useTheme();

  const togglePasswordVisibility = () => setSecureText(!secureText);
  const hideSnackbar = () => setSnackbar({ ...snackbar, visible: false });

  const malagasyPhoneRegex = /^(?:\+261|0)(32|33|34|38|39)\d{7}$/;

  const handlePhoneNumberChange = (text: string) => {
    setNumTel(text);
    setIsValidPhone(malagasyPhoneRegex.test(text));
  };

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbar({ visible: true, message, type });
  };

  const handleSendCode = async () => {
    setLoading(true);
    try {
      const response = await api.post('/forgot-password', { num_tel });
      if (response.status === 200) {
        showSnackbar('Code envoyé avec succès', 'success');
        setCodeSent(true);
      } else {
        showSnackbar('Erreur lors de l\'envoi du code', 'error');
      }
    } catch (error: unknown) {
      let errorMessage = 'Une erreur est survenue';
      if (typeof error === 'object' && error !== null) {
        const axiosError = error as AxiosError<ErrorResponse>;
        if (axiosError.response?.data?.msg) {
          errorMessage = axiosError.response.data.msg;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      }
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (new_password !== confirmPassword) {
      showSnackbar('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    if (new_password.length < 6) {
      showSnackbar('Le mot de passe doit contenir au moins 6 caractères', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/reset-password', { num_tel, reset_code, new_password });
      if (response.status === 200) {
        showSnackbar('Mot de passe modifié avec succès', 'success');
        navigation.navigate('/(auth)/login');
      } else {
        showSnackbar('Erreur lors de la réinitialisation du mot de passe', 'error');
      }
    } catch (error: unknown) {
      let errorMessage = 'Une erreur est survenue';
      if (typeof error === 'object' && error !== null) {
        const axiosError = error as AxiosError<ErrorResponse>;
        if (axiosError.response?.data?.msg) {
          errorMessage = axiosError.response.data.msg;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      }
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <IconButton
            icon="arrow-left"
            size={30}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            iconColor={theme.colors.primary}
          />

          <View style={styles.contentContainer}>
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
              Mot de passe oublié
            </Text>

            {!codeSent ? (
              <>
                <Text variant="bodyLarge" style={[styles.label, { color: COLORS.primary }]}>
                  Veuillez saisir votre numéro de téléphone
                </Text>

                <TextInput
                  mode="outlined"
                  label="Numéro de téléphone"
                  placeholder="03X XX XXX XX"
                  value={num_tel}
                  onChangeText={handlePhoneNumberChange}
                  keyboardType="phone-pad"
                  style={styles.input}
                  textColor={COLORS.primary}
                  placeholderTextColor={COLORS.gray2}
                  theme={{
                    colors: {
                      primary: COLORS.primary,
                      placeholder: COLORS.primary,
                      text: COLORS.primary,
                      onSurfaceVariant: COLORS.gray2
                    }
                  }}
                />

                <Button
                  mode="contained"
                  onPress={handleSendCode}
                  disabled={!isValidPhone || loading}
                  loading={loading}
                  style={styles.button}
                  labelStyle={styles.buttonText}
                  theme={{ colors: { primary: theme.colors.secondary } }}
                >
                  Envoyer le code
                </Button>
              </>
            ) : (
              <>
                <Text variant="bodyLarge" style={[styles.label, { color: COLORS.primary }]}>
                  Entrez le code de vérification et votre nouveau mot de passe
                </Text>

                <TextInput
                  mode="outlined"
                  label="Code de vérification"
                  value={reset_code}
                  onChangeText={setResetCode}
                  keyboardType="number-pad"
                  style={styles.input}
                  textColor={COLORS.primary}
                  placeholderTextColor={COLORS.primary}
                  theme={{
                    colors: {
                        primary: COLORS.primary,
                        placeholder: COLORS.primary,
                        text: COLORS.primary,
                        onSurfaceVariant: COLORS.gray2
                    }
                  }}
                />

                {[{
                  label: 'Nouveau mot de passe',
                  value: new_password,
                  onChange: setNewPassword
                }, {
                  label: 'Confirmer le mot de passe',
                  value: confirmPassword,
                  onChange: setConfirmPassword
                }].map((item, index) => (
                  <TextInput
                    key={index}
                    mode="outlined"
                    label={item.label}
                    value={item.value}
                    onChangeText={item.onChange}
                    secureTextEntry={secureText}
                    style={styles.input}
                    textColor={COLORS.primary}
                    placeholderTextColor={COLORS.primary}
                    right={
                      <TextInput.Icon
                        icon={secureText ? "eye" : "eye-off"}
                        onPress={togglePasswordVisibility}
                        color={COLORS.gray2}
                      />
                    }
                    theme={{
                      colors: {
                        primary: COLORS.primary,
                        placeholder: COLORS.primary,
                        text: COLORS.primary,
                        onSurfaceVariant: COLORS.gray2
                      }
                    }}
                  />
                ))}

                <Button
                  mode="contained"
                  onPress={handleResetPassword}
                  disabled={loading}
                  loading={loading}
                  style={styles.button}
                  labelStyle={styles.buttonText}
                  theme={{ colors: { primary: theme.colors.secondary } }}
                >
                  Modifier le mot de passe
                </Button>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={hideSnackbar}
        duration={3000}
        style={{
          backgroundColor: snackbar.type === 'success'
            ? COLORS.green
            : COLORS.red
        }}
      >
        <Text style={{ color: 'white' }}>{snackbar.message}</Text>
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flexContainer: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02
  },
  backButton: {
    marginTop: 20,
    alignSelf: 'flex-start',
    marginLeft: -20
  },
  contentContainer: {
    marginTop: height * 0.02
  },
  title: {
    marginBottom: height * 0.02,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  label: {
    textAlign: 'center',
    marginBottom: height * 0.02,
    color: COLORS.primary
  },
  input: {
    marginBottom: height * 0.02,
    backgroundColor: 'transparent'
  },
  button: {
    marginTop: height * 0.02,
    borderRadius: 5,
    backgroundColor: COLORS.gray,
    padding: SIZES.medium / 2
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default ForgotPassword;

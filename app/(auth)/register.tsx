import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Snackbar, Checkbox } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { Link } from 'expo-router';

export default function Register() {
  const [formData, setFormData] = useState({
    nom: '',
    num_tel: '',
    password: '',
    confirmPassword: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showCheckboxError, setShowCheckboxError] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [secureTextConfirm, setSecureTextConfirm] = useState(true);
  const [loading, setLoading] = useState(false);

  // Snackbar states
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'error' | 'success'>('error');

  const { onRegister } = useAuth();
  const malagasyPhoneRegex = /^(?:\+261|0)(32|33|34|38|39)\d{7}$/;

  const showSnackbar = (message: string, type: 'error' | 'success' = 'error') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  const handleRegister = async () => {
    // Validation côté client
    if (!formData.nom.trim()) {
      showSnackbar('Veuillez entrer votre nom');
      return;
    }

    if (!formData.num_tel.trim()) {
      showSnackbar('Veuillez entrer votre numéro de téléphone');
      return;
    }

    if (!malagasyPhoneRegex.test(formData.num_tel)) {
      showSnackbar('Numéro malgache invalide. Format: +261 XX XXX XX XX ou 0XX XXX XX XX');
      return;
    }

    if (!formData.password) {
      showSnackbar('Veuillez entrer un mot de passe');
      return;
    }

    if (formData.password.length < 6) {
      showSnackbar('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showSnackbar('Les mots de passe ne correspondent pas');
      return;
    }

    if (!acceptTerms) {
      setShowCheckboxError(true);
      showSnackbar('Vous devez accepter les conditions');
      return;
    }

    setLoading(true);

    try {
      const result = await onRegister(
        formData.nom.trim(),
        formData.num_tel.trim(),
        formData.password
      );
      
      if (result.error) {
        showSnackbar(result.msg || "Erreur lors de l'inscription");
      } else {
        showSnackbar(result.msg || "Inscription réussie!", 'success');
        setFormData({
          nom: '',
          num_tel: '',
          password: '',
          confirmPassword: '',
        });
        setAcceptTerms(false);
      }
    } catch (error) {
      showSnackbar("Une erreur inattendue est survenue");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez Voie Rapide aujourd'hui</Text>

        <TextInput
          style={styles.input}
          mode="outlined"
          label="Votre nom complet"
          value={formData.nom}
          onChangeText={(text) => handleChange('nom', text)}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          mode="outlined"
          label="Numéro de téléphone"
          value={formData.num_tel}
          onChangeText={(text) => handleChange('num_tel', text)}
          keyboardType="phone-pad"
          placeholder="+261 34 00 000 00"
        />

        <TextInput
          style={styles.input}
          mode="outlined"
          label="Mot de passe"
          value={formData.password}
          onChangeText={(text) => handleChange('password', text)}
          secureTextEntry={secureText}
          right={
            <TextInput.Icon
              icon={secureText ? 'eye-off' : 'eye'}
              onPress={() => setSecureText(!secureText)}
            />
          }
        />

        <TextInput
          style={styles.input}
          mode="outlined"
          label="Confirmer le mot de passe"
          value={formData.confirmPassword}
          onChangeText={(text) => handleChange('confirmPassword', text)}
          secureTextEntry={secureTextConfirm}
          right={
            <TextInput.Icon
              icon={secureTextConfirm ? 'eye-off' : 'eye'}
              onPress={() => setSecureTextConfirm(!secureTextConfirm)}
            />
          }
        />

        <View style={styles.checkboxContainer}>
          <Checkbox
            status={acceptTerms ? 'checked' : 'unchecked'}
            onPress={() => {
              setAcceptTerms(!acceptTerms);
              setShowCheckboxError(false);
            }}
            color="#6750A4"
          />
          <Text style={styles.checkboxText}>J'accepte les termes et conditions</Text>
        </View>
        {showCheckboxError && (
          <Text style={styles.errorText}>Vous devez accepter les conditions</Text>
        )}

        <Button
          mode="contained"
          style={styles.button}
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          labelStyle={styles.buttonLabel}
        >
          S'inscrire
        </Button>

        <View style={styles.footer}>
          <Text>Vous avez déjà un compte? </Text>
          <Link href="/login" style={styles.link}>
            Se connecter
          </Link>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={[
          styles.snackbar,
          snackbarType === 'success' ? styles.successSnackbar : styles.errorSnackbar
        ]}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#6750A4',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
    backgroundColor: '#6750A4',
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    color: '#6750A4',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkboxText: {
    marginLeft: 8,
    color: '#333',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    fontSize: 14,
  },
  snackbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  successSnackbar: {
    backgroundColor: '#4CAF50',
  },
  errorSnackbar: {
    backgroundColor: '#F44336',
  },
});
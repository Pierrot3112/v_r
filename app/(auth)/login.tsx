import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Snackbar, ActivityIndicator } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useAuth } from '../lib/context/AuthContext';
import { COLORS, SIZES } from '../lib/constants';

export default function Login() {
  const [num_tel, setNumTel] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { onLogin, getRole, onLogout } = useAuth();

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleLogin = async () => {
    if (!num_tel || !password) {
      showSnackbar('Tous les champs sont obligatoires');
      return;
    }

    setLoading(true);
    try {
      const result = await onLogin(num_tel.trim(), password.trim());
      
      if (result.error) {
        showSnackbar(result.msg);
        setLoading(false);
        return;
      }

      const token = result.token;
      if (!token) {
        showSnackbar('Erreur lors de la connexion');
        setLoading(false);
        return;
      }

      const role = await getRole(token);
      if (role === 'client') {
        router.replace('/(tabs)/home');
      } else {
        showSnackbar("Votre compte n'est pas un compte client");
        await onLogout();
        setLoading(false);
      }
    } catch (error) {
      showSnackbar('Une erreur inattendue est survenue');
      setLoading(false);
    } finally {
      setLoading(false);
    }
};

  const handleNumTelChange = (text: string) => {
    const formattedText = text.replace(/[^0-9]/g, '').slice(0, 10); 
    setNumTel(formattedText);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voie Rapide</Text>
      <Text style={styles.subtitle}>Se connecter pour continuer</Text>

      <TextInput
        style={styles.input}
        mode="outlined"
        label="Numéro mobile"
        value={num_tel}
        onChangeText={handleNumTelChange}
        keyboardType="phone-pad"
        placeholder="0340000000"
        textColor='#fff'
        theme={{ colors: { onSurfaceVariant: COLORS.gray2 } }}
      />

      <TextInput
        style={styles.input}
        mode="outlined"
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        textColor='#fff'
        theme={{ colors: { onSurfaceVariant: COLORS.gray2 } }}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowPassword(!showPassword)}
            color={COLORS.gray2}
          />
        }
      />

      <Button
        mode="contained"
        style={[styles.button, { justifyContent: 'center' }]}
        labelStyle={styles.buttonLabel}
        onPress={handleLogin}
        disabled={loading}
        contentStyle={{ height: 48 }}
      >
        Se connecter
      </Button>

      <View style={styles.links}>
        <Link href="/forgot-password" style={styles.link}>
          Mot de passe oublié?
        </Link>
        <Link href="/register" style={styles.link}>
          Créer un compte
        </Link>
      </View>

      <View style={{marginTop: 20}}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <Text> </Text>
        )}
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={styles.snackbar}
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
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#023047',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#ffb703',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
    borderColor: '#fb8500'
  },
  button: {
    marginTop: 8,
    paddingVertical: 2,
    backgroundColor: '#fb8500',
  },
  buttonLabel: {
    color: COLORS.primary,
    fontSize: 18,
  },
  links: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  link: {
    color: '#ffb703',
    textDecorationLine: 'underline',
  },
  snackbar: {
    backgroundColor: '#015782a0',
    position: 'absolute',
    bottom: 10,
    width: SIZES.width - 20,
  },
});
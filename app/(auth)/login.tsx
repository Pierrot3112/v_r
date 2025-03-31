import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useAuth } from '../lib/context/AuthContext';

export default function Login() {
  const [num_tel, setNumTel] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { onLogin } = useAuth();

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const login = () => {
    router.replace('/(tabs)/home');
  } 

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
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (error) {
      showSnackbar('Erreur de connexion');
    } finally {
      setLoading(false);
    }
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
        onChangeText={setNumTel}
        keyboardType="phone-pad"
        placeholder="034 00 000 00"
        textColor='#fff'
        theme={{ colors: { onSurfaceVariant: '#fff' } }}
      />

      <TextInput
        style={styles.input}
        mode="outlined"
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        textColor='#fff'
        theme={{ colors: { onSurfaceVariant: '#fff' } }}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowPassword(!showPassword)}
            color='#ffb703'
          />
        }
      />

      <Button
        mode="contained"
        style={styles.button}
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
        labelStyle={styles.buttonLabel}
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

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
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
    paddingVertical: 8,
    backgroundColor: '#fb8500',
  },
  buttonLabel: {
    color: '#fff',
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
    bottom: 20,
    left: 20,
    right: 20,
  },
});
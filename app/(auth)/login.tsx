import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link, router } from 'expo-router';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // Add login logic here
    router.replace('/(tabs)/search');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Voie Rapide</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TextInput
        style={styles.input}
        mode="outlined"
        label="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="+261 34 00 000 00"
      />

      <TextInput
        style={styles.input}
        mode="outlined"
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />

      <Button
        mode="contained"
        style={styles.button}
        onPress={handleLogin}
      >
        Sign In
      </Button>

      <View style={styles.links}>
        <Link href="/forgot-password" style={styles.link}>
          Forgot Password?
        </Link>
        <Link href="/register" style={styles.link}>
          Create an Account
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
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
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
  },
  links: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  link: {
    color: '#6750A4',
    textDecorationLine: 'underline',
  },
});
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link } from 'expo-router';

export default function ForgotPassword() {
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);

  const handleResetPassword = () => {
    // Add password reset logic here
    setSent(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter your phone number and we'll send you instructions to reset your password
      </Text>

      {!sent ? (
        <>
          <TextInput
            style={styles.input}
            mode="outlined"
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+261 34 00 000 00"
          />

          <Button
            mode="contained"
            style={styles.button}
            onPress={handleResetPassword}
          >
            Send Reset Instructions
          </Button>
        </>
      ) : (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>
            Reset instructions have been sent to your phone number.
          </Text>
          <Text style={styles.successSubtext}>
            Please check your messages for further instructions.
          </Text>
        </View>
      )}

      <Link href="/login" style={styles.link}>
        Back to Sign In
      </Link>
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
  successContainer: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 8,
    marginVertical: 20,
  },
  successText: {
    fontSize: 16,
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 14,
    color: '#388E3C',
    textAlign: 'center',
  },
  link: {
    marginTop: 24,
    color: '#6750A4',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
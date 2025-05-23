import { useState } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Snackbar, Checkbox, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../lib/context/AuthContext';
import { Link, useRouter } from 'expo-router';
import ConditionModal from '../lib/components/ConditionModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../lib/constants';

export default function Register() {
  const router = useRouter();
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
  const [modalVisible, setModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'error' | 'success'>('error');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { onRegister } = useAuth();
  const malagasyPhoneRegex = /^0(32|33|34|38|39)\d{7}$/;

  const formatPhoneNumber = (input: string) => {
    let cleaned = input.replace(/\D/g, '').substring(0, 10);
    let formatted = '';
    
    if (cleaned.length > 0) formatted = cleaned.substring(0, 3);
    if (cleaned.length > 3) formatted += ' ' + cleaned.substring(3, 5);
    if (cleaned.length > 5) formatted += ' ' + cleaned.substring(5, 8);
    if (cleaned.length > 8) formatted += ' ' + cleaned.substring(8, 10);
    
    return formatted;
  };

  const showSnackbar = (message: string, type: 'error' | 'success' = 'error') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  const handleRegister = async () => {
    if (!formData.nom.trim()) {
      showSnackbar('Veuillez entrer votre nom');
      return;
    }
  
    const cleanedPhone = formData.num_tel.replace(/\s/g, '');
    
    if (!malagasyPhoneRegex.test(cleanedPhone)) {
      showSnackbar('Numéro invalide. Format: 034 00 000 00');
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
        cleanedPhone,
        formData.password
      );
  
  
      if (result.error) {
        showSnackbar(result.msg);
        setLoading (false);
      } else {
        const cleanedPhone = formData.num_tel.replace(/\s/g, '') || "0340000000"; 
        
        showSnackbar("Inscription réussie!", 'success');
        const now = Date.now();
        await AsyncStorage.setItem('lastResendTime', now.toString());
       
        setTimeout(() => {
          router.push({
            pathname: '/validCodeSms',
            params: { 
              phoneNumber: cleanedPhone,
              forceTimer: 'true' 
            }
          });
        }, 500);
      }
    } catch (error) {
      let errorMessage = "Erreur lors de l'inscription";
      setLoading(false);
      if (error instanceof Error) {
        errorMessage = error.message;
        setLoading(false);
      }
      showSnackbar(errorMessage, 'error');
      setLoading(false);
    }
  };

  const handleChange = (name: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: name === 'num_tel' ? formatPhoneNumber(value) : value
    }));
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
          textColor={COLORS.primary}
        theme={{ colors: { onSurfaceVariant: COLORS.gray2 } }}
        />

        <TextInput
          style={styles.input}
          mode="outlined"
          label="Numéro de téléphone"
          value={formData.num_tel}
          onChangeText={(text) => handleChange('num_tel', text)}
          keyboardType="phone-pad"
          placeholder="034 00 000 00"
          textColor={COLORS.primary}
        theme={{ colors: { onSurfaceVariant: COLORS.gray2 } }}
        />

        <TextInput
          style={styles.input}
          mode="outlined"
          label="Mot de passe"
          value={formData.password}
          onChangeText={(text) => handleChange('password', text)}
          secureTextEntry={secureText}
          textColor={COLORS.primary}
          theme={{ colors: { onSurfaceVariant: COLORS.gray2 } }}
          right={
            <TextInput.Icon
              icon={secureText ? 'eye' : 'eye-off'}
              onPress={() => setSecureText(!secureText)}
              color={COLORS.gray2}
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
          textColor={COLORS.primary}
          theme={{ colors: { onSurfaceVariant: COLORS.gray2 } }}
          right={
            <TextInput.Icon
              icon={secureTextConfirm ? 'eye' : 'eye-off'}
              onPress={() => setSecureTextConfirm(!secureTextConfirm)}
              color={COLORS.gray2}
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
            color={acceptTerms ? COLORS.gray : COLORS.gray2}
          />

          <Text style={styles.checkboxText}>
            J'accepte les{' '}
            <Text 
              style={{ color: COLORS.gray , textDecorationLine: 'underline' }}
              onPress={() => setModalVisible(true)}
            >
              termes et conditions
            </Text>
          </Text>
        </View>
        {showCheckboxError && (
          <Text style={styles.errorText}>Vous devez accepter les conditions</Text>
        )}

       <Button
          mode="contained"
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
          contentStyle={{ height: 48 }}
        >
          S'inscrire
        </Button>

        <View style={{marginTop: 20}}>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text> </Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Vous avez déjà un compte? </Text>
          <Link href="/login" style={styles.link}>
            Se connecter
          </Link>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.headModal}>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalCloseText}>×</Text>
          </TouchableOpacity>
          
          <ConditionModal />
        </View>
      </Modal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={[
          styles.snackbar,
          snackbarType === 'success' ? styles.successSnackbar : styles.errorSnackbar
        ]}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#023047',
    justifyContent: 'center',
    minHeight: '100%',
    padding: 5,
    paddingTop: 50,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#fb8500',
  },
  subtitle: {
    fontSize: 16,
    color: '#8ecae6',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
    backgroundColor: '#fb8500',
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
  footerText: {
    color: '#8ecae6',
  },
  link: {
    color: '#fb8500',
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
    color: COLORS.primary,
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
    backgroundColor: COLORS.green,
  },
  errorSnackbar: {
    backgroundColor: COLORS.red,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#023047',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fb8500',
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  modalCloseText: {
    color: 'red',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fb8500',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    color: COLORS.primary,
    fontSize: 14,
    lineHeight: 20,
  },
  modalScroll: {
    maxHeight: '80%',
  },
  modal: {
    height: '100%',
    width: '98%',
    alignSelf: 'center',
    position: 'relative',
    top: 100,
  },

  headModal: {
      backgroundColor: COLORS.bgBlue,
      paddingHorizontal: 20,
      borderRadius: 10,
      paddingTop: 2,
      paddingBottom: 20,
  },

});
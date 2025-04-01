import { useState } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Snackbar, Checkbox } from 'react-native-paper';
import { useAuth } from '../lib/context/AuthContext';
import { Link, useRouter } from 'expo-router';
import ConditionModal from '../lib/components/ConditionModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../lib/constants';

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
      showSnackbar('Numéro malgache invalide. Format: 034 00 000 00');
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
      } else {
        const cleanedPhone = formData.num_tel.replace(/\s/g, '') || "0340000000"; 
        
        showSnackbar("Inscription réussie!", 'success');
        const now = Date.now();
        await AsyncStorage.setItem('lastResendTime', now.toString());
       
        setTimeout(() => {
          router.push({
            pathname: '/(auth)/validCodeSms',
            params: { 
              phoneNumber: cleanedPhone,
              forceTimer: 'true' 
            }
          });
        }, 1500);
      }
    } catch (error) {
      showSnackbar("Erreur lors de la communication avec le serveur");
    } finally {
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
          textColor='#ffffff'
        />

        <TextInput
          style={styles.input}
          mode="outlined"
          label="Numéro de téléphone"
          value={formData.num_tel}
          onChangeText={(text) => handleChange('num_tel', text)}
          keyboardType="phone-pad"
          placeholder="034 00 000 00"
          textColor='#ffffff'
        />

        <TextInput
          style={styles.input}
          mode="outlined"
          label="Mot de passe"
          value={formData.password}
          onChangeText={(text) => handleChange('password', text)}
          secureTextEntry={secureText}
          textColor='#ffffff'
          right={
            <TextInput.Icon
              icon={secureText ? 'eye-off' : 'eye'}
              onPress={() => setSecureText(!secureText)}
              color={'#ffffff'}
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
          textColor='#ffffff'
          right={
            <TextInput.Icon
              icon={secureTextConfirm ? 'eye-off' : 'eye'}
              onPress={() => setSecureTextConfirm(!secureTextConfirm)}
              color={'#ffffff'}
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
            color="#fb8500"
          />
          <Text style={styles.checkboxText}>
            J'accepte les{' '}
            <Text 
              style={{ color: '#fb8500', textDecorationLine: 'underline' }}
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
          loading={loading}
          disabled={loading}
          labelStyle={styles.buttonLabel}
        >
          S'inscrire
        </Button>

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
    color: '#FFFFFF',
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
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  modalScroll: {
    maxHeight: '80%',
  },
  modal: {
      height: '98%',
      width: '98%',
      alignSelf: 'center',
      position: 'relative',
      top: -2,
  },

  headModal: {
      backgroundColor: COLORS.bgBlue,
      paddingHorizontal: 20,
      borderRadius: 10,
      paddingTop: 50,
      paddingBottom: 20,
  },

});
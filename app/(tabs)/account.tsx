import React, { useState, useEffect } from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Image,
  StyleSheet,
} from 'react-native';
import { ActivityIndicator, Button, Text, TextInput, Card } from 'react-native-paper';
import api from "../lib/config/AxiosConfig";
import styles from '../lib/styles/account.client.style';
import { COLORS, SIZES } from '../lib/constants';

const AccountClient = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCreditId, setSelectedCreditId] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [isBuying, setIsBuying] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const creditOptions = [
    { id: "1", name: "5 Crédits", price: "5 000 Ariary" },
    { id: "2", name: "12 Crédits", price: "10 000 Ariary" },
    { id: "3", name: "30 Crédits", price: "25 000 Ariary" },
  ];

  const paymentOptions = [
    { id: 1, image: require('../../assets/images/mvola.png'), name: "MVola" },
    { id: 2, image: require('../../assets/images/orangeMoney.png'), name: "Orange Money" },
    { id: 3, image: require('../../assets/images/airtelMoney.png'), name: "Airtel Money" },
  ];

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await api.get("/me");
        setUser(response.data);
      } catch (err) {
        setError(err.message || "Une erreur s'est produite");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleBuy = async () => {
    if (!selectedCreditId || !selectedPaymentId) {
      alert("Veuillez sélectionner un crédit et un moyen de paiement");
      return;
    }
    
    setIsBuying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
    } finally {
      setIsBuying(false);
    }
  };

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
    } finally {
      setIsValidating(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: COLORS.bgBlue, height: SIZES.height, marginTop: 0 }]}> 
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <SafeAreaView style={styles.global}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: COLORS.bgBlue }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

          <View style={styles.paymentContainer}>
            <Text style={styles.paymentTitle}>Choix de Crédit</Text>
            <View style={styles.container}>
              {creditOptions.map((option) => (
                <Card 
                  key={option.id} 
                  onPress={() => setSelectedCreditId(option.id)}
                  style={[
                    styles.imageContainer, 
                    selectedCreditId === option.id && styles.selected
                  ]}
                >
                  <Card.Content>
                    <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>
                      {option.name}
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </View>
            <Text style={[styles.paymentTitle, { color: COLORS.primary }]}>
              {creditOptions.find(option => option.id === selectedCreditId)?.price || " "}
            </Text>

            <Text style={styles.paymentTitle}>Choix de paiement</Text>
            <View style={styles.container}>
              {paymentOptions.map((option) => (
                <Card 
                  key={option.id} 
                  onPress={() => setSelectedPaymentId(option.id)}
                  style={[
                    styles.imageContainer, 
                    selectedPaymentId === option.id && styles.selected
                  ]}
                >
                  <Card.Cover source={option.image} style={styles.image} />
                </Card>
              ))}
            </View>

            <Button 
              mode="contained" 
              onPress={handleBuy} 
              loading={isBuying} 
              style={styles.achatBtn}
              disabled={!selectedCreditId || !selectedPaymentId}
            >
              Acheter
            </Button>
          </View>

          <View style={[styles.codeContainer, isKeyboardVisible && { marginBottom: 250 }]}>
            <TextInput 
              mode="outlined" 
              label="Entrer ici votre code" 
              style={styles.codeInput}
              theme={{ colors: { text: '#FFFFFF' } }}
              placeholderTextColor="#FFFFFF"
              textColor="#FFFFFF"
            />
            <Button 
              mode="contained" 
              onPress={handleValidate} 
              loading={isValidating} 
              style={styles.validBtn}
            >
              Valider
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AccountClient;
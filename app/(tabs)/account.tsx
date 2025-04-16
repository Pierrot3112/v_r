import React, { useState, useEffect } from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal
} from 'react-native';
import { ActivityIndicator, Button, Text, Card, Snackbar } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import api from "../lib/config/AxiosConfig";
import styles from '../lib/styles/account.client.style';
import { COLORS, SIZES } from '../lib/constants';

const AccountClient = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCreditId, setSelectedCreditId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [isBuying, setIsBuying] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [webviewUrl, setWebviewUrl] = useState('');

  const creditOptions = [
    { id: "1", value: "5", label: "Crédits", price: "5 000 Ariary" },
    { id: "2", value: "12", label: "Crédits", price: "10 000 Ariary" },
    { id: "3", value: "30", label: "Crédits", price: "25 000 Ariary" }
  ];

  const paymentOptions = [
    { id: 1, image: require('../../assets/images/mvola.png'), name: "MVola" },
    { id: 2, image: require('../../assets/images/orangeMoney.png'), name: "Orange Money" },
    { id: 3, image: require('../../assets/images/airtelMoney.png'), name: "Airtel Money" }
  ];

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await api.get("/me");
        setUser(response.data);
      } catch (err: any) {
        setError(err.message || "Une erreur s'est produite");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleBuy = () => {
    if (!selectedCreditId || !selectedPaymentId) {
      showSnackbar("Veuillez sélectionner un crédit et un moyen de paiement");
      return;
    }
    setShowModal(true);
  };

  const handleConfirmPurchase = async() => {
    setShowModal(false);
    setLoading(true);
    setIsBuying(true);
    try {
      const response = await api.post("/purchase", {
        creditId: selectedCreditId,
        paymentId: selectedPaymentId
      });
      if (response.status === 200) {
        let simulatedUrl = "https://default-paiement.com";
        setWebviewUrl(simulatedUrl);
        setShowWebView(true);
      } else {
        showSnackbar("Erreur lors de l'achat.");
      }
    } catch (err) {
      let simulatedUrl = "https://www.google.com";
      if (selectedPaymentId === 1) simulatedUrl = "https://www.mvola.mg";
      else if (selectedPaymentId === 2) simulatedUrl = "https://www.orange.mg";
      else if (selectedPaymentId === 3) simulatedUrl = "https://www.airtel.mg";
      setWebviewUrl(simulatedUrl);
      setShowWebView(true);
      setLoading(false);
    } finally {
      setIsBuying(false);
    }
  };

  const handleCancelPurchase = () => {
    setShowModal(false);
    showSnackbar("Achat annulé");
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: COLORS.bgBlue, height: SIZES.height }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  if (showWebView) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgBlue }}>
        <WebView source={{ uri: webviewUrl }} style={{ flex: 1, backgroundColor: COLORS.bgBlue }} />
        <Button
          mode="contained"
          onPress={() => setShowWebView(false)}
          style={{ margin: 20 }}
          labelStyle={{ color: COLORS.bgBlue }}
        >
          Quitter
        </Button>
      </SafeAreaView>
    );
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
                    selectedCreditId === option.id && styles.selected,
                  ]}
                >
                  <Card.Content>
                    <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
                      {option.value}{'\n'}{option.label}
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
                    selectedPaymentId === option.id && styles.selected,
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
              labelStyle={{ color: COLORS.primary }}
            >
              Acheter
            </Button>
          </View>
        </ScrollView>
        <Modal
          animationType="fade"
          transparent={true}
          visible={showModal}
          onDismiss={() => setShowModal(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                Voulez-vous confirmer l'achat de {creditOptions.find(option => option.id === selectedCreditId)?.value} {creditOptions.find(option => option.id === selectedCreditId)?.label} pour le prix de {creditOptions.find(option => option.id === selectedCreditId)?.price} par {paymentOptions.find(option => option.id === selectedPaymentId)?.name} ?
              </Text>
              <View style={styles.modalButtons}>
                <Pressable style={[styles.button, styles.buttonCancel]} onPress={handleCancelPurchase}>
                  <Text style={styles.textStyle}>Annuler</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.buttonConfirm]} onPress={handleConfirmPurchase}>
                  <Text style={styles.textStyle}>Confirmer</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={{ backgroundColor: COLORS.red }}
          action={{
            label: 'OK',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AccountClient;

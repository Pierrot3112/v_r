import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  ScrollView,
  SafeAreaView,
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Pressable,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  ActivityIndicator,
  AnimatedFAB,
  Portal,
  Modal,
} from 'react-native-paper';
import { COLORS, SIZES } from '../lib/constants';

interface HistoryProps {
  visible: boolean;
  extended?: boolean;
  label?: string;
  animateFrom?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  iconMode?: 'dynamic' | 'static';
}

const History: React.FC<HistoryProps> = ({
  visible,
  extended = true,
  label = 'Acheter crédit',
  animateFrom = 'right',
  style,
  iconMode = 'static',
}) => {
  const [isExtended, setIsExtended] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollPosition = Math.floor(event.nativeEvent.contentOffset.y) ?? 0;
    setIsExtended(currentScrollPosition <= 0);
  };

  const fabStyle = { [animateFrom]: 16 };

  const historique = [
    {
      id: 1,
      credits: 12,
      montant: 10000,
      moyen: 'Orange Money',
      date: '2024-04-10',
    },
    {
      id: 2,
      credits: 5,
      montant: 5000,
      moyen: 'MVola',
      date: '2024-04-02',
    },,
    {
      id: 3,
      credits: 5,
      montant: 5000,
      moyen: 'MVola',
      date: '2024-04-02',
    },,
    {
      id: 4,
      credits: 5,
      montant: 5000,
      moyen: 'MVola',
      date: '2024-04-02',
    },,
    {
      id: 5,
      credits: 5,
      montant: 5000,
      moyen: 'MVola',
      date: '2024-04-02',
    },,
    {
      id: 6,
      credits: 5,
      montant: 5000,
      moyen: 'MVola',
      date: '2024-04-02',
    },,
    {
      id: 7,
      credits: 5,
      montant: 5000,
      moyen: 'MVola',
      date: '2024-04-02',
    },
  ];

  const handleAchat = () => {
    setModalVisible(false);
    setTimeout(() => {
      router.replace('/(tabs)/account');
    }, 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
       {historique.length === 0 ? (
          <Text style={styles.emptyMessage}>
            Aucun achat de crédit n'a été effectué.
          </Text>
        ) : (
          historique.map(item => (
            item && (
              <Card key={item.id} style={styles.card}>
                <Card.Content>
                  <Text style={styles.historiqueText}>
                    {item.credits} crédits achetés via {item.moyen} - {item.montant.toLocaleString()} Ar
                  </Text>
                  <Text style={styles.date}>Date : {item.date}</Text>
                </Card.Content>
              </Card>
            )
          ))
        )}
      </ScrollView>

      <AnimatedFAB
        icon="shopping"
        label={label}
        extended={isExtended}
        onPress={showModal}
        visible={visible}
        animateFrom={animateFrom}
        iconMode={iconMode}
        style={[styles.fabStyle, style, fabStyle]}
      />

      <Portal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={hideModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Voulez-vous vraiment effectuer un achat de crédit?</Text>
            <View style={styles.buttonRow}>
              <Pressable onPress={hideModal} style={[styles.btn, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.btnText}>Refuser</Text>
              </Pressable>
              <Pressable onPress={handleAchat} style={[styles.btn, { backgroundColor: COLORS.gray }]}>
                <Text style={[styles.btnText, { color: COLORS.primary }]}>Accepter</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgBlue,
  },
  content: {
    padding: 20,
  },
  card: {
    marginBottom: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  historiqueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#37474F',
  },
  date: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  button: {
    marginTop: 20,
    backgroundColor: COLORS.secondary,
  },
  loaderContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  fabStyle: {
    bottom: 16,
    right: 16,
    position: 'absolute',
    backgroundColor: COLORS.secondary,
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: '#888',
  },  
  centeredView: {
    height: SIZES.height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalContainer: {
    backgroundColor: COLORS.primary,
    padding: SIZES.height * 0.02,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
  },
  modalText: {
    color: COLORS.black,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btn: {
    paddingVertical: SIZES.height * 0.01,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  btnText: {
    color: COLORS.black,
    fontWeight: 'bold',
  },
});

export default History;

import { Tabs, useRouter } from 'expo-router';
import { User, LogOut, Home } from 'lucide-react-native';
import { StyleSheet, View, Modal, Pressable, Text } from 'react-native';
import { useAuth } from '../lib/context/AuthContext';
import Header from '../lib/components/header';
import { useState } from 'react';

export default function TabLayout() {
  const { onLogout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);

  const handleLogout = () => {
    hideModal();
    onLogout().then(() => {
      router.replace('/(auth)/login'); 
    });
  };

  return (
    <View style={styles.container}>
      <Header />
      <Tabs
        screenOptions={{
          header: () => null,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#023047',
          tabBarInactiveTintColor: '#FFFFFF',
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 14,
            marginTop: -5,
          },
        }}
        initialRouteName="home"
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
          listeners={() => ({
            tabPress: (e) => {
              router.navigate({
                pathname: '/home',
                params: { reset: Date.now() },
              });
            },
          })}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Compte',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="logout"
          options={{
            title: 'Déconnexion',
            tabBarIcon: ({ color, size }) => <LogOut size={size} color={color} />,
          }}
          listeners={() => ({
            tabPress: (e) => {
              e.preventDefault();
              showModal();
            },
          })}
        />
      </Tabs>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={hideModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Êtes-vous sûr de vouloir vous déconnecter ?</Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.button, styles.buttonCancel]}
                onPress={hideModal}
              >
                <Text style={styles.textStyle}>Annuler</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonConfirm]}
                onPress={handleLogout}
              >
                <Text style={styles.textStyle}>Confirmer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: '#fb8500',
    height: 60,
    justifyContent: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 20,
    elevation: 2,
  },
  buttonConfirm: {
    backgroundColor: '#fb8500',
  },
  buttonCancel: {
    backgroundColor: '#023047',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
  },
});
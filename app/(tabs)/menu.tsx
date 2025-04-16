import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { Icon, Divider } from 'react-native-paper';
import { View, StyleSheet, Modal, Text, Pressable, BackHandler, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../lib/constants';
import Settings from '../(menus)/settings';
import Favorites from '../(menus)/favorites';
import Profile from '../(menus)/profile';
import History from '../(menus)/history';

const screenWidth = Dimensions.get('window').width;
const ViewSize = (screenWidth - 60) / 4;

const MenuComponent = () => {
  const { onLogout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const router = useRouter();

  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);

  const handleLogout = () => {
    onLogout().then(() => {
      router.replace('/(auth)/login');
    });
  };

  const handleSelect = (menuKey: string) => {
    setActiveMenu(menuKey);
  };

  const handleBack = () => {
    setActiveMenu(null);
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activeMenu) {
        handleBack();
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [activeMenu]);

  useFocusEffect(
    React.useCallback(() => {
      setActiveMenu(null);
    }, [])
  );

  const renderContent = () => {
    let ContentComponent;
    let ContentTitle;
    switch (activeMenu) {
      case 'profile':
        ContentComponent = Profile;
        ContentTitle = 'Mon Profil';
        break;
      case 'favorites':
        ContentComponent = Favorites;
        ContentTitle = 'Mes Favories';
        break;
      case 'settings':
        ContentComponent = Settings;
        ContentTitle = 'Paramètres'
        break;
      case 'history':
        ContentComponent = History;
        ContentTitle = 'Historiques d\'achat de crédit';
        break;
      default:
        return null;
    }
    return (
      <>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Icon source="arrow-left" size={30} color={COLORS.primary} />
          <Text style={{color: COLORS.primary, fontSize: 18, textAlign: 'center'}}> { ContentTitle }</Text>
        </Pressable>
        <ContentComponent />
      </>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgBlue }}>
      {!activeMenu ? (
        <>
          <ScrollView contentContainerStyle={styles.menuContainer}>
            <Text style={styles.sectionTitle}>Mon Compte</Text>
            <View style={styles.grid}>
              <TouchableOpacity style={styles.View} onPress={() => handleSelect('profile')}>
                <View style={styles.ViewContent}>
                  <View style={styles.iconView}>
                    <Icon source="account" color={COLORS.primary} size={30} />
                  </View>
                  <Text style={styles.ViewText}>Mon Profil</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.View} onPress={() => handleSelect('favorites')}>
                <View style={styles.ViewContent}>
                  <View style={styles.iconView}>
                    <Icon source="heart" color={COLORS.primary} size={30} />
                  </View>
                  <Text style={styles.ViewText}>Mes Favoris</Text>
                </View>
              </TouchableOpacity>
              
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Préférences</Text>
            <View style={styles.grid}>
              <TouchableOpacity style={styles.View} onPress={() => handleSelect('settings')}>
                <View style={styles.ViewContent}>
                  <View style={styles.iconView}>
                    <Icon source="cog" color={COLORS.primary} size={30} />
                  </View>
                  <Text style={styles.ViewText}>Paramètres</Text>
                </View>
              </TouchableOpacity>
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Activités</Text>
            <View style={styles.grid}>
              <TouchableOpacity style={styles.View} onPress={() => handleSelect('history')}>
                <View style={styles.ViewContent}>
                  <View style={styles.iconView}>
                    <Icon source="history" color={COLORS.primary} size={30} />
                  </View>
                  <Text style={styles.ViewText}>Historiques</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.logoutContainer}>
            <Pressable onPress={showModal} style={styles.logoutButton}>
              <Icon source="logout" color="white" size={30} />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </Pressable>
          </View>
        </>
      ) : (
        renderContent()
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={hideModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Voulez-vous vraiment vous déconnecter ?</Text>
            <View style={styles.buttonRow}>
              <Pressable onPress={hideModal} style={[styles.btn, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.btnText}>Annuler</Text>
              </Pressable>
              <Pressable onPress={handleLogout} style={[styles.btn, { backgroundColor: COLORS.gray }]}>
                <Text style={[styles.btnText, { color: COLORS.primary }]}>Se déconnecter</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    padding: SIZES.height * 0.02,
  },
  sectionTitle: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    marginTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },
  View: {
    width: ViewSize,
    height: ViewSize / 1.5,
    borderColor: COLORS.gray2,
    borderRadius: 10,
    marginBottom: 15,
  },
  ViewContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ViewText: {
    fontWeight: 'bold',
    color: COLORS.primary,
    fontSize: 12,
  },
  logoutContainer: {
    padding: 5,
    backgroundColor: COLORS.bgBlue,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    marginLeft: 20,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
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
  backButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 10,
    alignSelf: 'flex-start',
    borderRadius: 5,
  },
  divider: {
    marginVertical: 0,
    backgroundColor: COLORS.gray,
  },
  iconView: {
    borderWidth: 1,
    borderRadius: '50%',
    borderColor: COLORS.gray2,
    width: '50%',
    height: '70%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MenuComponent;

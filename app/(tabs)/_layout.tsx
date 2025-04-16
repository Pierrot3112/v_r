import { Tabs, useRouter } from 'expo-router';
import { Home, ShoppingCart, Menu as MenuIcon } from 'lucide-react-native';
import { StyleSheet, View, Text } from 'react-native';
import Header from '../lib/components/header';
import { SIZES } from '../lib/constants';

export default function TabLayout() {

  

  return (
    <View style={styles.container}>
      <Header />
      <Tabs
        screenOptions={{
          header: () => null,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 14,
            marginTop: -5,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ focused }) => (
              <Home size={24} color={focused ? '#023047' : '#FFFFFF'} />
            ),
            tabBarLabel: ({ focused }) => (
              <Text style={{ color: focused ? '#023047' : '#FFFFFF' }}>
                Accueil
              </Text>
            ),
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: 'Menu',
            tabBarIcon: ({ focused }) => (
              <MenuIcon size={24} color={focused ? '#023047' : '#FFFFFF'} />
            ),
            tabBarLabel: ({ focused }) => (
              <Text style={{ color: focused ? '#023047' : '#FFFFFF' }}>
                Menu
              </Text>
            ),
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Achat Crédits',
            tabBarIcon: ({ focused }) => (
              <ShoppingCart size={24} color={focused ? '#023047' : '#FFFFFF'} />
            ),
            tabBarLabel: ({ focused }) => (
              <Text style={{ color: focused ? '#023047' : '#FFFFFF' }}>
                Achat Crédits
              </Text>
            ),
          }}
        />
      </Tabs>
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
  menuOverlay: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    elevation: 5,
    zIndex: 10,
    width: SIZES.width,
  },
  overlayBlocker: {
    position: 'absolute',
    top: 70,
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9,
  },
});

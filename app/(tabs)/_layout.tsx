import { Tabs } from 'expo-router';
import { Search, Heart, User, LogOut } from 'lucide-react-native';
import { Appbar } from 'react-native-paper';
import { StyleSheet, View, Text } from 'react-native';
import { useAuth } from '../context/AuthContext'; 
import api from '../config/AxiosConfig';

function Header() {
  const { authState, onLogout } = useAuth();

  const me = api.get('/me');
  return (
    <Appbar.Header style={styles.header}>
      <View style={styles.headerSection}>
        <Text style={styles.phoneNumber}>
          Numero
        </Text>
      </View>
      <View style={styles.headerSection}>
        <Text style={styles.logo}>VOIE RAPIDE</Text>
      </View>
      <View style={styles.headerSection}>
        <Text style={styles.balance}>Credits: $100</Text>
      </View>
    </Appbar.Header>
  );
}

export default function TabLayout() {
  const { onLogout } = useAuth(); 

  return (
    <View style={styles.container}>
      <Header />
      <Tabs
        screenOptions={{
          header: () => null,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#6750A4',
          tabBarShowLabel: true,
        }}
        initialRouteName="search"
      >
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favorites',
            tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="logout"
          options={{
            title: 'Logout',
            tabBarIcon: ({ color, size }) => <LogOut size={size} color={color} />,
          }}
          listeners={() => ({
            tabPress: (e) => {
              e.preventDefault();
              onLogout();
            },
          })}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  phoneNumber: {
    fontSize: 12,
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  balance: {
    fontSize: 12,
    color: '#6750A4',
  },
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});
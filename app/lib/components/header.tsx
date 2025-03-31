import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Appbar } from 'react-native-paper';
import api from '../config/AxiosConfig';

type UserData = {
  num_tel?: string;
  credit?: number;
};

function Header() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<UserData>("/me");
      setUser(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <Appbar.Header style={styles.header}>
      <View style={styles.headerSection}>
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <Text style={styles.phoneNumber}>{user?.num_tel || 'N/A'}</Text>
        )}
      </View>
      <View style={styles.headerSection}>
        <Text style={styles.logo}>VOIE RAPIDE</Text>
      </View>
      <View style={styles.headerSection}>
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : error ? (
          <Text style={styles.error}>--</Text>
        ) : (
          <Text style={styles.balance}>Credits: {user?.credit || 0}</Text>
        )}
      </View>
    </Appbar.Header>
  );
}

export default Header;

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fb8500',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    height: 40, 
  },
  headerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  phoneNumber: {
    fontSize: 12,
    color: '#fff',
  },
  logo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  balance: {
    fontSize: 12,
    color: '#fff',
  },
  error: {
    fontSize: 12,
    color: '#ffebee',
  },
});
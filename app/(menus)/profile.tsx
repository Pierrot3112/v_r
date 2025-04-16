import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import { Text, Card, Divider, IconButton, Icon } from 'react-native-paper';
import { COLORS, SIZES } from '../lib/constants';
import api from '../lib/config/AxiosConfig';



type UserData = {
  num_tel?: string;
  email?:string;
  name?:string;
};

const Profile = () => {
  const [user, setUser] = useState<UserData | null>(null);

  const fetchMe = useCallback(async () => {
    try {
      const response = await api.get<UserData>("/me");
      setUser(response.data);
    } catch (err: any) {
    } finally {
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Icon source="account" color={COLORS.primary} size={110} />
        </View>
        <Text style={{color: COLORS.primary, fontSize: 20, fontWeight: 'bold'}}>{user?.name}</Text>
      </View>

      <Divider style={styles.divider} />

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        <Card.Content>
          <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 20,}}>
            <Text style={styles.label}>Téléphone : {user?.num_tel || 'N/A'}</Text>
          </View>
        </Card.Content>

        <Pressable style={styles.editButton}>
          <IconButton icon="pencil" iconColor="white" />
          <Text style={styles.editText}>Modifier le profil</Text>
        </Pressable>
      </Card>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgBlue,
  },
  scrollContainer: {
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 10,
    backgroundColor: COLORS.gray2,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  email: {
    fontSize: 16,
    color: COLORS.gray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 10,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.gray2,
    borderRadius: 10,
    padding: 10,
  },
  label: {
    fontWeight: 'bold',
    color: COLORS.gray,
    marginTop: 10,
  },
  value: {
    color: COLORS.black,
    fontSize: 16,
  },
  editButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  editText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray,
    alignSelf: 'stretch',
    marginVertical: 10,
  },
});

export default Profile;

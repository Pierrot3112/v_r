import React, { memo, useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, Card, IconButton, Snackbar } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import api from '../config/AxiosConfig';
import { COLORS } from '../constants';

type ItineraryItem = {
  itineraires_id: string;
  en_passant: string;
  distance: number;
  somme_duree_trajection: number;
  depart_nom: string;
  arrivee_nom: string;
};

type ItinerairesResultsProps = {
  departureId: string;
  arrivalId: string;
  selectedValue: number;
  onReset: () => void;
  onItemSelect: (id: string) => void;
};

const formatDuration = (minutes: number): string => {
  const totalSeconds = Math.round(minutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  let remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;
  if (remainingSeconds > 0) {
    remainingMinutes += 1;
  }
  
  return [hours, remainingMinutes]
    .map((val, index) => (val > 0 ? `${val}${['h', 'min'][index]}` : ''))
    .filter(Boolean)
    .join(' ') || '0min';
};

const ResultItem = memo(({ item, onPress }: { item: ItineraryItem; onPress: (id: string) => void }) => {
  return (
    <Card style={styles.item} onPress={() => onPress(item.itineraires_id)}>
      <Card.Content style={styles.itemContent}>
        <View style={[styles.iconContainer, {marginLeft: -20, marginRight: 30}]}>
          <IconButton icon="car" size={24} />
        </View>
        <View style={styles.textContainer}>
          <Text variant="titleSmall" style={styles.title}>
            En passant par: {item.en_passant}
          </Text>
          <Text variant="bodyMedium" style={styles.distance}>
            Distance: {item.distance} km
          </Text>
          <Text variant="bodyMedium" style={styles.duration}>
            Durée: {formatDuration(item.somme_duree_trajection)}
          </Text>
        </View>
        < View style={styles.iconContainer}>
          <IconButton icon="chevron-right" size={24} />
        </View>
      </Card.Content>
    </Card>
  );
});

const ItinerairesResults = ({ 
  departureId, 
  arrivalId, 
  selectedValue, 
  onReset,
  onItemSelect
}: ItinerairesResultsProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'error' | 'info'>('error');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['itineraries', departureId, arrivalId, selectedValue],
    queryFn: async () => {
      try {
        const response = await api.post('/get_itineraire', {
          id_depart: departureId,
          id_arrive: arrivalId,
          type_rec: selectedValue,
        });
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Réponse serveur invalide');
        }
        return response.data.filter((item) => item?.itineraires_id);
      } catch (error) {
        showSnackbar('Aucun itinéraire trouvé pour ces critères', 'error');
        throw error;
      }
    },
    enabled: !!departureId && !!arrivalId,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const showSnackbar = (message: string, type: 'error' | 'info') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      showSnackbar('Impossible de mettre à jour les données', 'error');
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);


  const handleItemPress = useCallback((id: string) => {
    onItemSelect(id);
  }, [onItemSelect]);

  return (
    <View style={[styles.container, { backgroundColor: COLORS.bgBlue }]}>
      <View style={styles.headerContainer}>
        <IconButton icon="arrow-left" size={24} onPress={onReset} iconColor={COLORS.primary} />
        <Text variant="titleLarge" style={styles.titlePage}>
          Itinéraires {selectedValue === 0 ? 'Le plus rapide' : 'Le plus court'}
        </Text>
      </View>

      {isLoading && !refreshing ? (
        <ActivityIndicator size="large" animating={true} style={styles.loader} color={COLORS.primary} />
      ) : (
        <FlatList
          data={data || []}
          renderItem={({ item }) => <ResultItem item={item} onPress={handleItemPress} />}
          keyExtractor={(item) => item.itineraires_id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              progressBackgroundColor={COLORS.bgBlue}
            />
          }
          ListEmptyComponent={
            <Text variant="bodyMedium" style={styles.emptyText}>
              Aucun itinéraire trouvé pour ces critères
            </Text>
          }
        />
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: snackbarType === 'error' ? COLORS.red : COLORS.primary }}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}>
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  titlePage: {
    marginLeft: 8,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 70,
  },
  item: {
    margin: 8,
    elevation: 2,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: 'hidden',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    flex: 1,
  },
  textContainer: {
    flex: 10,
  },
  title: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 4,
    backgroundColor: '#666',
    paddingLeft: 5, 
    textAlign: 'left',
    borderRadius: 5,
  },
  distance: {
    color: COLORS.gray || '#666',
  },
  duration: {
    color: COLORS.gray || '#666',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: COLORS.primary,
  },
});

export default React.memo(ItinerairesResults);
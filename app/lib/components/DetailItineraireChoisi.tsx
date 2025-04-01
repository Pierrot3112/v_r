import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, SafeAreaView, RefreshControl } from 'react-native';
import moment from 'moment';
import 'moment/locale/fr';
import {
  Appbar,
  Text,
  ActivityIndicator,
  Card,
  Divider,
  Badge,
  useTheme,
  Snackbar,
} from 'react-native-paper';
import api from '../config/AxiosConfig';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { AxiosError } from 'axios';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

type RouteDetailScreenProps = {
  itineraryId: string;
  onBack: () => void;
};

type ErrorResponse = {
  error?: string;
  message?: string;
};

type TrafficInfo = {
  color?: string;
  estimation?: number;
  description?: string;
  datetime?: string;
};

type Connection = {
  point_depart_nom: string;
  distance: number;
  last_information?: TrafficInfo;
};

type RouteDetails = {
  depart_nom: string;
  arrivee_nom: string;
  distance: number;
  somme_duree_trajection: number;
  connections?: Connection[];
};

const formatTravelDuration = (minutes: number) => {
  const totalSeconds = Math.round(minutes * 60);
  
  if (totalSeconds < 60) {
    return `${totalSeconds} s`;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  let formattedDuration = '';
  if (hours > 0) {
    formattedDuration += `${hours}h `;
  }
  if (remainingMinutes > 0 || hours > 0) {
    formattedDuration += `${remainingMinutes}min `;
  }
  if (remainingSeconds > 0 || (remainingMinutes === 0 && hours === 0)) {
    formattedDuration += `${remainingSeconds}s`;
  }

  return formattedDuration.trim();
};

const RouteDetailScreen = ({ itineraryId, onBack }: RouteDetailScreenProps) => {
  const theme = useTheme();
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigation = useNavigation();

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const fetchRouteDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<RouteDetails>(`/itineraire/${itineraryId}`);
      setRouteDetails(response.data);
      setError(null);
      moment.locale('fr');
    } catch (err: unknown) {
      let errorMessage = 'Erreur lors de la récupération des données';
      
      if (err instanceof Error) {
        errorMessage += `: ${err.message}`;
      } else if (typeof err === 'object' && err !== null) {
        const axiosError = err as AxiosError<ErrorResponse>;
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      }
      
      setError(errorMessage);
      showSnackbar(errorMessage);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [itineraryId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRouteDetails();
  }, [fetchRouteDetails]);

  useEffect(() => {
    fetchRouteDetails();
  }, [fetchRouteDetails]);

  const formatDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return 'Date inconnue';
    return moment(dateTimeString).format('D MMMM à HH:mm');
  };

  const getTrafficStatusIcon = (trafficColor?: string) => {
    switch (trafficColor?.toUpperCase()) {
      case 'VERT':
        return '🟩 (fluide)';
      case 'ORANGE':
        return '🟧 (moyen)';
      case 'ROUGE':
        return '🟥 (bouché)';
      default:
        return '⚪ (inconnu)';
    }
  };

  const getTrafficBorderColor = (trafficColor?: string) => {
    switch (trafficColor?.toUpperCase()) {
      case 'VERT':
        return COLORS.green;
      case 'ORANGE':
        return COLORS.yellow;
      case 'ROUGE':
        return COLORS.red;
      default:
        return COLORS.primary;
    }
  };

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    }
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" animating={true} />
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons 
          name="arrow-back" 
          size={24} 
          color={COLORS.primary}  
          onPress={handleGoBack}
          style={styles.backButton}
        />
        <Text variant="titleLarge" style={styles.titlePage}>
          Détails du trajet
        </Text>
      </View>

      <Card style={styles.routeSummaryCard}>
        <Card.Content>
          <Text style={styles.routeText}>
            Départ : {routeDetails?.depart_nom}
          </Text>
          <Text style={styles.routeText}>
            Arrivée : {routeDetails?.arrivee_nom}
          </Text>
          <Text style={styles.routeText}>
            Distance : {routeDetails?.distance} km
          </Text>
          <Text style={styles.routeText}>
            Durée totale : {Number(routeDetails?.somme_duree_trajection).toFixed(0)} min
          </Text>
        </Card.Content>
      </Card>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.bgBlue}
          />
        }
      >

        {routeDetails?.connections?.map((connection, index) => (
          <View key={`connection-${index}`} style={styles.routeSegmentCard}>
              <View style={styles.segmentHeader}>
                <Ionicons name="location-sharp" size={28} color={theme.colors.primary} />
                <Badge style={styles.locationBadge}>
                  {connection.point_depart_nom}
                </Badge>
              </View>

              <View
                style={[
                  styles.segmentDetails,
                  { borderLeftColor: getTrafficBorderColor(connection.last_information?.color) },
                ]}
              >
                <Text style={styles.segmentText}>
                  Distance : {connection.distance} km
                </Text>
                <Text style={styles.segmentText}>
                  Durée : {formatTravelDuration(connection.last_information?.estimation || 0)}
                </Text>
                <Text style={styles.segmentText}>
                  Trafic : {getTrafficStatusIcon(connection.last_information?.color)}
                </Text>
                <Text style={styles.segmentText}>
                  Heure : {formatDateTime(connection.last_information?.datetime)}
                </Text>
                <Text style={styles.segmentText}>
                  Info : {connection.last_information?.description || 'Aucune information'}
                </Text>
              </View>
          </View>
        ))}

        <View style={styles.finalDestinationCard}>
          <View style={styles.segmentHeader}>
            <Ionicons name="location-sharp" size={24} color={theme.colors.primary} />
            <Badge style={styles.locationBadge}>
              {routeDetails?.arrivee_nom}
            </Badge>
          </View>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: theme.colors.error }}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgBlue,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titlePage: {
    marginLeft: 8,
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingLeft: 50,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentContainer: {
    padding: width * 0.04,
    paddingBottom: 70,
  },
  routeSummaryCard: {
    backgroundColor: COLORS.secondary,
    marginBottom: height * 0.02,
    borderRadius: 8,
    elevation: 3,
    marginHorizontal: width * 0.05,
  },
  routeText: {
    fontSize: width * 0.035,
    color: 'white',
    marginBottom: height * 0.005,
  },
  routeSegmentCard: {
    marginBottom: height * 0.01,
    borderRadius: 8,
    backgroundColor: 'transparent'
  },
  finalDestinationCard: {
    marginBottom: height * 0.02,
    borderRadius: 8,
    backgroundColor: 'transparent'
  },
  segmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.005,
    backgroundColor: 'transparent'
  },
  locationBadge: {
    marginLeft: width * 0.02,
    fontSize: width * 0.04,
    backgroundColor: 'transparent',
    flexWrap: 'wrap',
    width: '80%', 
    alignItems: 'flex-start',
  },
  segmentDetails: {
    marginLeft: width * 0.1,
    borderLeftWidth: 5,
    padding: width * 0.02,
    paddingLeft: width * 0.07,
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: width * 0.04,
    color: 'white',
    marginBottom: height * 0.005,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: height * 0.015,
    color: COLORS.green
  },
  errorText: {
    fontSize: width * 0.04,
    textAlign: 'center',
    color: 'red',
  },
  backButton: {
    padding: 10,
  },
});

export default RouteDetailScreen;
import { View, StyleSheet, BackHandler } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import FormSearch from '../lib/components/formSearch';
import ItinerairesResults from '../lib/components/ItinerairesResults';
import RouteDetailScreen from '../lib/components/DetailItineraireChoisi';
import { Point } from '../lib/components/formSearch';
import { useLocalSearchParams } from 'expo-router';

export default function SearchScreen() {
  const [searchParams, setSearchParams] = useState<{
    departure: Point;
    arrival: Point;
    selectedValue: number;
  } | null>(null);

  const [selectedItinerary, setSelectedItinerary] = useState<string | null>(null);
  const params = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => {
      const resetState = () => {
        setSearchParams(null);
        setSelectedItinerary(null);
      };

      resetState();
      
      return () => {};
    }, [params.reset]) 
  );

  useEffect(() => {
    const backAction = () => {
      if (selectedItinerary) {
        handleBackToList();
        return true;
      } else if (searchParams) {
        handleResetSearch();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [selectedItinerary, searchParams]);

  const handleSearchSubmit = (params: {
    departure: Point;
    arrival: Point;
    selectedValue: number;
  }) => {
    setSearchParams(params);
    setSelectedItinerary(null);
  };

  const handleResetSearch = () => {
    setSearchParams(null);
    setSelectedItinerary(null);
  };

  const handleBackToList = () => {
    setSelectedItinerary(null);
  };

  return (
    <View style={styles.container}>
      {selectedItinerary ? (
        <RouteDetailScreen 
          itineraryId={selectedItinerary}
          onBack={handleBackToList}
        />
      ) : searchParams ? (
        <ItinerairesResults 
          departureId={searchParams.departure.id} 
          arrivalId={searchParams.arrival.id}
          selectedValue={searchParams.selectedValue}
          onReset={handleResetSearch}
          onItemSelect={setSelectedItinerary}
        />
      ) : (
        <FormSearch onSearchSubmit={handleSearchSubmit} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#023047',
  },
});
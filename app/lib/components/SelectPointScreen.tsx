import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import pointsData from '../utils/points.json'

type SelectPointRouteParamList = {
  SelectPoint: {
    field: string;
    setPoint: React.Dispatch<React.SetStateAction<any>>;
  };
};

const SelectPointScreen = () => {
  const route = useRoute<RouteProp<SelectPointRouteParamList, 'SelectPoint'>>();
  const navigation = useNavigation();

  const { setPoint, field } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPoints, setFilteredPoints] = useState(pointsData);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = pointsData.filter(
      (point) =>
        point.nom.toLowerCase().includes(query.toLowerCase()) ||
        (point.location?.toLowerCase() || '').includes(query.toLowerCase())
    );
    setFilteredPoints(filtered);
  };

  const selectPoint = (point: any) => {
    setPoint(point);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Rechercher un point..."
        value={searchQuery}
        onChangeText={handleSearch}
        mode="outlined"
        style={styles.searchInput}
      />
      <FlatList
        data={filteredPoints}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => selectPoint(item)} style={styles.pointItem}>
            <Text>{item.nom} - {item.location}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  searchInput: {
    marginBottom: 20,
  },
  pointItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default SelectPointScreen;

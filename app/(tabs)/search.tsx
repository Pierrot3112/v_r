import { View, StyleSheet } from 'react-native';
import { Searchbar, Card, Text } from 'react-native-paper';
import { useState } from 'react';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Cover source={{ uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff' }} />
          <Card.Title title="Nike Shoes" subtitle="$199.99" />
        </Card>
        <Card style={styles.card}>
          <Card.Cover source={{ uri: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30' }} />
          <Card.Title title="Smart Watch" subtitle="$299.99" />
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 16,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
});
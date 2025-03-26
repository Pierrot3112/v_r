import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Title style={styles.title}>Your Favorites</Title>
      <Card style={styles.card}>
        <Card.Cover source={{ uri: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e' }} />
        <Card.Content>
          <Title>Headphones</Title>
          <Paragraph>Premium wireless headphones with noise cancellation</Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button>Remove</Button>
          <Button mode="contained">Buy Now</Button>
        </Card.Actions>
      </Card>
      
      <Card style={styles.card}>
        <Card.Cover source={{ uri: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f' }} />
        <Card.Content>
          <Title>Camera</Title>
          <Paragraph>Professional DSLR camera with 4K video</Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button>Remove</Button>
          <Button mode="contained">Buy Now</Button>
        </Card.Actions>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
});
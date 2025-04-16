import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../lib/constants';

export default function Settings() {
  return (
    <View style={styles.containerSettings}>
      <Text>Paramètres</Text>
     </View>
  );
}

const styles = StyleSheet.create({
  containerSettings: {
    height: SIZES.height - 125,
    backgroundColor: COLORS.bgBlue,
  }
});
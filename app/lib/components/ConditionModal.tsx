import React from 'react';
import { ScrollView, View, Text, FlatList, StyleSheet } from 'react-native';
import data from '../utils/data.json';
import { COLORS } from '../constants';

const ConditionModal = () => {
  const conditionData = data.conditions;

  return (
    <ScrollView style={styles.modalContainer}>
      <Text style={styles.titleCondition}>
        Conditions Générales d'Utilisation (CGU)
      </Text>

      <FlatList
        style={{ marginTop: 15 }}
        data={conditionData}
        keyExtractor={(item, index) => index.toString()}
        scrollEnabled={false} // Désactive le scroll du FlatList car déjà dans un ScrollView
        renderItem={({ item }) => (
          <View style={styles.conditionItem}>
            <Text style={styles.conditionTitle}>
              {item.id}: {item.titre}
            </Text>
            <Text style={styles.conditionText}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Pour toute question ou réclamation, veuillez contacter notre support
          via l'application ou par e-mail.
        </Text>
        <Text style={styles.updateText}>Dernière mise à jour : Janvier 2025</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 1,
  },
  titleCondition: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  conditionItem: {
    marginBottom: 20,
  },
  conditionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 5,
  },
  conditionText: {
    fontSize: 14,
    color: COLORS.primary,
    lineHeight: 20,
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.gray2,
    marginBottom: 10,
  },
  updateText: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
});

export default ConditionModal;
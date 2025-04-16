import React from 'react';
import { ScrollView, View, Text, FlatList, StyleSheet } from 'react-native';
import data from '../utils/data.json';
import { COLORS, SIZES } from '../constants';

const ConditionModal = () => {
  const conditionData = data.conditions;

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.titleCondition}>
        Conditions Générales d'Utilisation (CGU)
      </Text>

      <ScrollView>
        <FlatList
          style={{ marginTop: 10 }}
          data={conditionData}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false} 
          renderItem={({ item }) => (
            <View style={styles.conditionItem}>
              <Text style={styles.conditionTitle}>
                {item.id}: {item.titre}
              </Text>
              <Text style={styles.conditionText}>{item.description}</Text>
            </View>
          )}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Pour toute question ou réclamation, veuillez contacter notre support
          via l'application ou par e-mail.
        </Text>
        <Text style={styles.updateText}>Dernière mise à jour : Janvier 2025</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    height: SIZES.height - 150,
    marginBottom: 20
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
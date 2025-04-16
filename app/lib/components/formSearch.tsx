import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Pressable } from "react-native";
import { Searchbar, Button, Text, Modal, Portal, Provider, RadioButton, Snackbar, Dialog } from "react-native-paper";
import pointsData from "../utils/points.json";
import { COLORS, SIZES } from "../constants";
import { Ionicons } from "@expo/vector-icons";
import api from "../config/AxiosConfig";
import { router } from "expo-router";

export type Point = {
  id: string;
  id_axe: string;
  nom: string;
  latitude: string;
  longitude: string;
  location: string | null;
};

type FormSearchProps = {
  onSearchSubmit: (params: { departure: Point; arrival: Point; selectedValue: number }) => void;
};

type UserCredit = {
  credit?: number;
};

const Select = () => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
    <Text style={styles.inputText}>Selectionner......</Text>
    <Ionicons name="chevron-down-outline" color={COLORS.gray2} size={18} />
  </View>
);

const FormSearch = ({ onSearchSubmit }: FormSearchProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [creditModal, setCreditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPoints, setFilteredPoints] = useState<Point[]>(pointsData);
  const [selectedField, setSelectedField] = useState<"departure" | "arrival" | null>(null);
  const [departure, setDeparture] = useState<Point | null>(null);
  const [arrival, setArrival] = useState<Point | null>(null);
  const [selectedValue, setSelectedValue] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"info" | "error" | "success">("info");
  const [credit, setCredit] = useState<UserCredit | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const lowerText = text.toLowerCase().trim();
    if (lowerText.length >= 3) {
      const words = lowerText.split(" ").filter(word => word);
      const filtered = pointsData.filter(point => {
        const field = ((point.nom || "") + " " + (point.location || "")).toLowerCase();
        return words.every(word => field.includes(word));
      });
      setFilteredPoints(filtered);
    } else {
      setFilteredPoints(pointsData);
    }
  }, []);

  const openModal = (field: "departure" | "arrival") => {
    setSelectedField(field);
    setSearchQuery("");
    setFilteredPoints(pointsData);
    setModalVisible(true);
  };

  const selectPoint = (point: Point) => {
    if (selectedField === "departure") setDeparture(point);
    if (selectedField === "arrival") setArrival(point);
    setModalVisible(false);
  };

  const fetchCredit = useCallback(async () => {
    try {
      const response = await api.get<UserCredit>("/me");
      setCredit(response.data);
    } catch {
      setSnackbarType("error");
      setSnackbarMessage("Erreur lors du chargement du crédit.");
      setSnackbarVisible(true);
    }
  }, []);

  useEffect(() => {
    fetchCredit();
  }, [fetchCredit]);

  const redirectToBuyCredit = () => {
    router.replace('/(tabs)/account');
    return;
  }

  const showSnackbar = (message: string, type: "info" | "error" | "success" = "info") => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  const handleSubmit = () => {
    if (!departure || !arrival) {
      showSnackbar("Veuillez sélectionner un point de départ et d'arrivée.", "error");
      return;
    }
    if (departure.id === arrival.id) {
      showSnackbar("Les points doivent être différents.", "error");
      return;
    }
    if (credit?.credit !== undefined && credit.credit <= 0) {
      setCreditModal(true);
      return;
    }
    if (credit?.credit !== undefined && credit.credit > 0) {
      onSearchSubmit({ departure, arrival, selectedValue });
    }
  };

  useEffect(() => {
    if (snackbarVisible) {
      const timer = setTimeout(() => {
        setSnackbarVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [snackbarVisible]);

  const snackbarStyle = {
    backgroundColor:
      snackbarType === "success"
        ? COLORS.green
        : snackbarType === "error"
        ? COLORS.red
        : COLORS.gray,
  };

  return (
    <Provider>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
          >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <View style={styles.searchContainer}>
                <TouchableOpacity onPress={() => openModal("departure")} style={styles.inputWrapper}>
                  <Text style={styles.label}>Point de départ</Text>
                  <View style={styles.inputField}>
                    <Text style={styles.inputText}>{departure?.nom || <Select />}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openModal("arrival")} style={styles.inputWrapper}>
                  <Text style={styles.label}>Point d'arrivée</Text>
                  <View style={styles.inputField}>
                    <Text style={styles.inputText}>{arrival?.nom || <Select />}</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.radioContainer}>
                  <RadioButton.Group onValueChange={v => setSelectedValue(Number(v))} value={selectedValue.toString()}>
                    <TouchableOpacity style={styles.radioOption} onPress={() => setSelectedValue(0)}>
                      <RadioButton color={COLORS.secondary} value="0" status={selectedValue === 0 ? "checked" : "unchecked"} />
                      <Text style={styles.radioLabel}>Le plus rapide</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.radioOption} onPress={() => setSelectedValue(1)}>
                      <RadioButton color={COLORS.secondary} value="1" status={selectedValue === 1 ? "checked" : "unchecked"} />
                      <Text style={styles.radioLabel}>Le plus court</Text>
                    </TouchableOpacity>
                  </RadioButton.Group>
                </View>
                <Button mode="contained" onPress={handleSubmit} style={styles.searchButton}>
                  Rechercher
                </Button>
              </View>
              <Portal>
                <Modal
                  visible={modalVisible}
                  onDismiss={() => setModalVisible(false)}
                  contentContainerStyle={[styles.modalContainer, { height: SIZES.height * 0.9, marginTop: keyboardHeight }]}
                >
                  <View style={styles.modalContent}>
                    <View style={styles.searchBarContainer}>
                      <Searchbar
                        onChangeText={handleSearch}
                        placeholder="Rechercher un point..."
                        style={styles.searchBar}
                        inputStyle={styles.searchInput}
                        autoComplete="off"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    <View style={[styles.pointsList, { height: SIZES.height * 0.9 - 130 }]}>
                      <FlatList
                        keyboardShouldPersistTaps="always"
                        data={filteredPoints}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                          <TouchableOpacity onPress={() => selectPoint(item)} style={styles.pointItem}>
                            <Text style={styles.pointName}>{item.nom}</Text>
                            {item.location && <Text style={styles.pointLocation}>{item.location}</Text>}
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </View>
                </Modal>
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={creditModal}
                  onDismiss={() => setCreditModal(false)}
                >
                  <View style={styles.centeredView}>
                    <View style={styles.modalContainer1}>
                      <Text style={styles.modalText}>Votre crédit est insuffisant! Veuillez le recharger.</Text>
                      <View style={styles.buttonRow}>
                        <Pressable 
                          onPress={() => setCreditModal(false)} 
                          style={[styles.btn, { backgroundColor: COLORS.primary }]}
                        >
                          <Text style={styles.btnText}>Annuler</Text>
                        </Pressable>
                        <Pressable 
                          onPress={() => {
                            setCreditModal(false);
                            redirectToBuyCredit();
                          }} 
                          style={[styles.btn, { backgroundColor: COLORS.gray }]}
                        >
                          <Text style={[styles.btnText, { color: COLORS.primary }]}>Recharger</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </Modal>
              </Portal>
            </ScrollView>
            <Snackbar
              visible={snackbarVisible}
              onDismiss={() => setSnackbarVisible(false)}
              wrapperStyle={{ marginBottom: keyboardHeight }}
              style={[styles.snackbar, snackbarStyle]}
              action={{ label: "OK", onPress: () => setSnackbarVisible(false) }}
            >
              {snackbarMessage}
            </Snackbar>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: SIZES.height * 0.01, backgroundColor: COLORS.bgBlue },
  searchContainer: { 
    padding: SIZES.height * 0.025, 
    borderRadius: SIZES.xSmall, 
    backgroundColor: COLORS.white, 
    borderWidth: 1, 
    borderColor: COLORS.secondary, 
    elevation: 2, 
    shadowColor: COLORS.black, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4,
    maxHeight: SIZES.height * 0.6,
  },
  inputWrapper: { marginBottom: SIZES.large },
  label: { 
    fontSize: SIZES.height * 0.025, 
    fontWeight: "bold", 
    color: COLORS.secondary, 
    marginBottom: SIZES.height * 0.01, 
  },
  inputField: { 
    padding: SIZES.height * 0.02, 
    borderWidth: 1, 
    borderRadius: SIZES.xSmall, 
    borderColor: COLORS.gray 
  },
  inputText: { 
    fontSize: SIZES.height * 0.02, 
    color: COLORS.gray2 
  },
  radioContainer: { marginVertical: SIZES.height * 0.01 },
  radioOption: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginVertical: SIZES.height * 0.008, 
  },
  radioLabel: { 
    fontSize: SIZES.height * 0.025, 
    color: COLORS.secondary, 
    marginLeft: SIZES.small 
  },
  searchButton: { 
    marginTop: SIZES.height * 0.01, 
    backgroundColor: COLORS.secondary, 
    borderRadius: SIZES.xSmall, 
    paddingVertical: SIZES.height * 0.008,
  },
  buttonLabel: { 
    color: COLORS.white, 
    fontSize: SIZES.height * 0.027, 
    fontWeight: "bold" 
  },
  modalContainer: { 
    backgroundColor: COLORS.bgBlue, 
    marginHorizontal: 0, 
    overflow: "hidden", 
    paddingBottom: SIZES.medium * 1.5 
  },
  modalContent: { flex: 1 },
  searchBarContainer: { 
    padding: SIZES.height * 0.01, 
    paddingBottom: SIZES.height * 0.005 
  },
  searchBar: { 
    backgroundColor: COLORS.white, 
    borderRadius: SIZES.xSmall,
    marginTop: 20, 
  },
  searchInput: { 
    fontSize: SIZES.height * 0.02, 
    color: COLORS.black, 
    height: 40 
  },
  pointsList: { 
    flex: 1, 
    paddingHorizontal: SIZES.height * 0.01, 
    marginBottom: 20 
  },
  pointItem: { 
    paddingVertical: SIZES.height * 0.008, 
    paddingHorizontal: SIZES.height * 0.01, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.tertiary,
    zIndex: 10, 
  },
  pointName: { 
    fontSize: SIZES.height * 0.017, 
    color: COLORS.primary, 
    fontWeight: "bold" 
  },
  pointLocation: { 
    fontSize: SIZES.height * 0.012, 
    color: COLORS.secondary, 
    marginTop: SIZES.height * 0.01, 
  },
  snackbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  }, 
  centeredView: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    height: SIZES.height,
  },
  modalContainer1: {
    backgroundColor: COLORS.white,
    padding: SIZES.height * 0.03,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
    elevation: 5,
  },
  modalText: {
    color: COLORS.black,
    fontSize: 18,
    marginBottom: 25,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
    minWidth: '45%',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FormSearch;
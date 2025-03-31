import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, FlatList, TouchableOpacity, StyleSheet, Keyboard, KeyboardAvoidingView, Platform } from "react-native";
import { Searchbar, Button, Text, Modal, Portal, Provider, RadioButton, Snackbar, TextInput } from "react-native-paper";
import pointsData from "../utils/points.json";
import { COLORS, SIZES } from "../constants";

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

const FormSearch = ({ onSearchSubmit }: FormSearchProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPoints, setFilteredPoints] = useState<Point[]>(pointsData);
  const [selectedField, setSelectedField] = useState<"departure" | "arrival" | null>(null);
  const [departure, setDeparture] = useState<Point | null>(null);
  const [arrival, setArrival] = useState<Point | null>(null);
  const [selectedValue, setSelectedValue] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [hiddenInputValue, setHiddenInputValue] = useState("");

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    setHiddenInputValue(searchQuery);
  }, [searchQuery]);

  const handleSearch = () => {

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const filtered = pointsData.filter(point => {
        const searchText = searchQuery.toLowerCase();
        return (
          point.nom.toLowerCase().includes(searchText) ||
          (point.location?.toLowerCase() || "").includes(searchText)
        );
      });
      setFilteredPoints(filtered);
    }, 300);
  };

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

  const handleSubmit = () => {
    if (!departure || !arrival) {
      setSnackbarMessage("Veuillez sélectionner un point de départ et d'arrivée.");
      setSnackbarVisible(true);
      return;
    }
    if (departure.id === arrival.id) {
      setSnackbarMessage("Les points doivent être différents.");
      setSnackbarVisible(true);
      return;
    }
    onSearchSubmit({ departure, arrival, selectedValue });
  };

  const modalHeight = SIZES.height * 0.9;
  const listHeight = Math.max(modalHeight - 130 - keyboardHeight, 100);
  const searchBarTheme = { colors: { primary: COLORS.secondary, text: COLORS.black } };

  useEffect(() => {
    if (snackbarVisible) {
      const timer = setTimeout(() => {
        setSnackbarVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [snackbarVisible]);

  return (
    <Provider>
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.searchContainer}>
            <TouchableOpacity onPress={() => openModal("departure")} style={styles.inputWrapper}>
              <Text style={styles.label}>Point de départ</Text>
              <View style={styles.inputField}>
                <Text style={styles.inputText}>{departure?.nom || 'Sélectionner...'}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => openModal("arrival")} style={styles.inputWrapper}>
              <Text style={styles.label}>Point d'arrivée</Text>
              <View style={styles.inputField}>
                <Text style={styles.inputText}>{arrival?.nom || 'Sélectionner...'}</Text>
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

            <Button mode="contained" onPress={handleSubmit} style={styles.searchButton} labelStyle={styles.buttonLabel}>
              Rechercher
            </Button>
          </View>

          <Portal>
            <Modal
              visible={modalVisible}
              onDismiss={() => setModalVisible(false)}
              contentContainerStyle={[styles.modalContainer, { height: modalHeight, marginTop: keyboardHeight }]}
            >
              <View style={styles.modalContent}>
                <View style={styles.searchBarContainer}>
                  <Searchbar
                    value={searchQuery}
                    placeholder="Rechercher un point..."
                    style={styles.searchBar}
                    inputStyle={styles.searchInput}
                    onChangeText={handleSearch}
                    autoComplete="off" 
                  />
                </View>

                <View style={[styles.pointsList, { height: listHeight }]}>
                  <FlatList
                    data={searchQuery ? filteredPoints : pointsData}
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
          </Portal>

          <TextInput
            value={hiddenInputValue}
            style={styles.hiddenInput}
            editable={false}
          />

          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            wrapperStyle={{ marginBottom: keyboardHeight }}
            action={{
              label: 'OK',
              onPress: () => setSnackbarVisible(false),
            }}
          >
            {snackbarMessage}
          </Snackbar>
        </KeyboardAvoidingView>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: SIZES.medium, backgroundColor: COLORS.bgBlue },
  searchContainer: { 
    padding: SIZES.medium, 
    borderRadius: SIZES.xSmall, 
    backgroundColor: COLORS.white, 
    borderWidth: 1, 
    borderColor: COLORS.secondary, 
    elevation: 2, 
    shadowColor: COLORS.black, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
  },
  inputWrapper: { marginBottom: SIZES.large },
  label: { 
    fontSize: SIZES.medium, 
    fontWeight: 'bold', 
    color: COLORS.secondary, 
    marginBottom: SIZES.xSmall 
  },
  inputField: { 
    padding: SIZES.small, 
    borderWidth: 1, 
    borderRadius: SIZES.xSmall, 
    borderColor: COLORS.gray 
  },
  inputText: { 
    fontSize: SIZES.medium, 
    color: COLORS.gray2 
  },
  radioContainer: { marginVertical: SIZES.medium },
  radioOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: SIZES.small 
  },
  radioLabel: { 
    fontSize: SIZES.medium, 
    color: COLORS.secondary, 
    marginLeft: SIZES.small 
  },
  searchButton: { 
    marginTop: SIZES.medium, 
    backgroundColor: COLORS.secondary, 
    borderRadius: SIZES.xSmall, 
    paddingVertical: SIZES.small 
  },
  buttonLabel: { 
    color: COLORS.white, 
    fontSize: SIZES.medium, 
    fontWeight: 'bold' 
  },
  modalContainer: { 
    backgroundColor: COLORS.bgBlue, 
    marginHorizontal: 0, 
    overflow: 'hidden', 
    paddingBottom: SIZES.medium * 1.5 
  },
  modalContent: { flex: 1 },
  searchBarContainer: { 
    padding: SIZES.medium, 
    paddingBottom: SIZES.small 
  },
  searchBar: { 
    backgroundColor: COLORS.white, 
    borderRadius: SIZES.xSmall 
  },
  searchInput: { 
    fontSize: SIZES.medium, 
    color: COLORS.black, 
    height: 40 
  },
  pointsList: { 
    flex: 1, 
    paddingHorizontal: SIZES.small, 
    marginBottom: 20 
  },
  pointItem: { 
    paddingVertical: SIZES.medium / 4, 
    paddingHorizontal: SIZES.medium, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.tertiary 
  },
  pointName: { 
    fontSize: SIZES.medium / 1.25, 
    color: COLORS.primary, 
    fontWeight: 'bold' 
  },
  pointLocation: { 
    fontSize: SIZES.small, 
    color: COLORS.secondary, 
    marginTop: SIZES.xSmall 
  },
  hiddenInput: { 
    height: 0, 
    width: 0, 
    opacity: 0 
  },
});

export default FormSearch;

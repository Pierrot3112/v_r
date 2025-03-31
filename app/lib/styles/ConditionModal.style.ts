import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import { COLORS, SIZES } from "../constants";


const styles = StyleSheet.create({
    modalContainer: {
        marginHorizontal: SIZES.medium,
    },

    titleCondition: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: SIZES.large,
    },

    title: {
        fontWeight: 'bold',
    }
})

export default styles;
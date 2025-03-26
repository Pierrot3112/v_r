import { Dimensions } from "react-native";
const { height, width } = Dimensions.get('window');


const COLORS = {
    primary: "#FFFFFF",
    secondary: "#219ebc",
    tertiary: "#8ecae6",

    bgBlue: "#023047", 
    complementaryOrange: "#dc6e08",

    gray: "#fb8500",
    gray2: "#023047",

    offwhite: "#F3F4F8",
    white: "#FFFFFF",
    black: "#000000",

    red: "#F44336",
    yellow: "#ffb703",
    green: "#4CAF50",

    lightWhite: "#FAFAFC",
};




const SIZES = {
    xSmall: 10,
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
    xxLarge: 44,
    height,
    width
};

export { COLORS, SIZES };
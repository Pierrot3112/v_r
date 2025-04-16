import React, { useEffect, useCallback } from 'react';
import { SafeAreaView, View, Image, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  withRepeat,
  interpolate,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './lib/config/AxiosConfig';
import { router } from 'expo-router';
import { COLORS, SIZES } from './lib/constants';

const TOKEN_KEY = "auth_token";

type RootStackParamList = {
  ValidCodeOtp: {
    phoneNumber: string;
  };
};

const SplashScreen = () => {
  useRoute<RouteProp<RootStackParamList, 'ValidCodeOtp'>>();

  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);
  const dot4 = useSharedValue(0);
  const loaderOpacity = useSharedValue(0);

  const checkToken = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  };

  const getRole = async (token: string): Promise<string> => {
    try {
      const response = await api.get("/me", { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      return response.data.role || "user";
    } catch {
      return "user";
    }
  };

  const checkAuth = useCallback(() => {
    checkToken().then(async (token) => {
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }
      const role = await getRole(token);
      router.replace(role === 'client' ? '/(tabs)/home' : '/(auth)/login');
    }).catch(() => {
      router.replace('/(auth)/login');
    });
  }, []);

  useEffect(() => {
    dot1.value = withDelay(0, withRepeat(withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }), -1, true));
    dot2.value = withDelay(150, withRepeat(withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }), -1, true));
    dot3.value = withDelay(300, withRepeat(withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }), -1, true));
    dot4.value = withDelay(450, withRepeat(withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }), -1, true));
    loaderOpacity.value = withTiming(1, { duration: 500 });

    const timer = setTimeout(() => {
      checkAuth();
    }, 5000);

    return () => clearTimeout(timer);
  }, [checkAuth]);

  const containerOpacityStyle = useAnimatedStyle(() => ({
    opacity: loaderOpacity.value,
  }));

  const createDotStyle = (dotValue: Animated.SharedValue<number>) =>
    useAnimatedStyle(() => {
      const scale = interpolate(dotValue.value, [0, 1], [1, 1.5]);
      const backgroundColor = interpolateColor(
        dotValue.value,
        [0, 1],
        [COLORS.primary, COLORS.gray]
      );
      return {
        transform: [{ scale }],
        backgroundColor,
      };
    });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgBlue }}>
      <View style={styles.container}>
        <Image 
          source={require('../assets/images/logoVoieRapide.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Animated.View style={[styles.dotsContainer, containerOpacityStyle]}>
          <Animated.View style={[styles.dot, createDotStyle(dot1)]} />
          <Animated.View style={[styles.dot, createDotStyle(dot2)]} />
          <Animated.View style={[styles.dot, createDotStyle(dot3)]} />
          <Animated.View style={[styles.dot, createDotStyle(dot4)]} />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.bgBlue,
    padding: 20,
  },
  logo: {
    marginTop: SIZES.height / 3.5,
    width: 80,
    height: 80,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginHorizontal: 5,
  },
});

export default SplashScreen;

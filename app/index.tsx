import React, { useEffect } from 'react';
import { SafeAreaView, View, Image, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  Easing,
  interpolate,
  Extrapolate,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { 
  Text,
  ActivityIndicator,
  useTheme
} from 'react-native-paper';
import { useCallback } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './lib/config/AxiosConfig';
import { COLORS } from './lib/constants';

const TOKEN_KEY = "auth_token";

const SplashScreen = () => {
    const theme = useTheme();
    
    const text1Position = useSharedValue(-200);
    const text2Position = useSharedValue(200);
    const logoScale = useSharedValue(0.5);
    const logoOpacity = useSharedValue(0);
    const loaderOpacity = useSharedValue(0);
    const progress = useSharedValue(0);

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
                headers: { 
                    Authorization: `Bearer ${token}` 
                } 
            });
            return response.data.role || "user";
        } catch {
            return "user";
        }
    };

    useEffect(() => {
        const animation = () => {
          text1Position.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.exp) });
          text2Position.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.exp) });
          
          logoScale.value = withSequence(
            withTiming(1.2, { duration: 500 }),
            withTiming(1, { duration: 500, easing: Easing.elastic(1) }
          ));
          
          logoOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
          
          progress.value = withRepeat(
            withTiming(1, { duration: 2000, easing: Easing.linear }),
            -1,
            false
          );
      
          checkAuth().finally(() => {
            loaderOpacity.value = withTiming(1, { duration: 500 });
          });
        };
      
        animation();
      }, []);

      const checkAuth = useCallback(async () => {
        try {
          const token = await checkToken();
          if (!token) {
            await router.replace('/(auth)/login');
            return;
          }
      
          const role = await getRole(token);
          await router.replace(role === 'client' ? '/(tabs)/home' : '/(auth)/login');
        } catch (error) {
          await router.replace('/(auth)/login');
        }
      }, []);

    const animatedText1Style = useAnimatedStyle(() => ({
        transform: [{ translateX: text1Position.value }],
        opacity: interpolate(text1Position.value, [-200, 0], [0, 1], Extrapolate.CLAMP)
    }));

    const animatedText2Style = useAnimatedStyle(() => ({
        transform: [{ translateX: text2Position.value }],
        opacity: interpolate(text2Position.value, [200, 0], [0, 1], Extrapolate.CLAMP)
    }));

    const logoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoScale.value }],
        opacity: logoOpacity.value
    }));

    const loaderStyle = useAnimatedStyle(() => ({
        opacity: loaderOpacity.value,
    }));

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgBlue }}>
            <View style={styles.container}>
                <Animated.Text style={[styles.title, animatedText1Style, { color: COLORS.primary }]}>
                    Voie Rapide
                </Animated.Text>
                
                <Animated.View style={[styles.logoContainer, logoStyle]}>
                    <Image 
                        source={require('../assets/images/logoVoieRapide.png')} 
                        style={styles.logo} 
                        resizeMode="contain"
                    />
                </Animated.View>
                
                <Animated.Text style={[styles.subtitle, animatedText2Style, { color: COLORS.primary }]}>
                    Tongasoa !
                </Animated.Text>
                
                <Animated.View style={[styles.loaderContainer, loaderStyle]}>
                    <ActivityIndicator 
                        animating={true} 
                        size="large" 
                        color={theme.colors.primary}
                    />
                </Animated.View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.bgBlue,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 24,
        fontWeight: '600',
        marginTop: 20,
    },
    logoContainer: {
        marginVertical: 30,
    },
    logo: {
        width: 150,
        height: 150,
    },
    loaderContainer: {
        marginTop: 40,
    },
});

export default SplashScreen;
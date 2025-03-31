import React from 'react';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { authState } = useAuth();
    const navigation = useNavigation();

    if (!authState?.authenticated) {
        navigation.navigate('Login' as never); 
        return null;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
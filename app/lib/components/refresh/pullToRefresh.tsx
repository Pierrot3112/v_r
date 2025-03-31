import React, { useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

interface RefreshableScrollViewProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
}

const RefreshableScrollView: React.FC<RefreshableScrollViewProps> = ({ 
  children, 
  onRefresh 
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#2196F3']}
          progressBackgroundColor="#ffffff"
        />
      }
    >
      {children}
    </ScrollView>
  );
};

export default RefreshableScrollView;
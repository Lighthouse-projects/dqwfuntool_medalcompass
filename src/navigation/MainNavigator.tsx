import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapScreen } from '../screens/MapScreen';
import { MyPageScreen } from '../screens/MyPageScreen';

export type MainTabParamList = {
  Map: { medalNo?: number; openHistory?: boolean; toggleHistory?: boolean } | undefined;
  History: undefined;
  MyPage: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1E88E5',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'ホーム',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="stars" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={MapScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // デフォルトの遷移を防止
            e.preventDefault();
            // Mapスクリーンに履歴パネルをトグルするパラメータを渡して遷移
            navigation.navigate('Map', { toggleHistory: true });
          },
        })}
        options={{
          tabBarLabel: 'メダルの思い出',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bookmarks" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{
          tabBarLabel: 'マイページ',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

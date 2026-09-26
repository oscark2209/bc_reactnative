// src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { HomeStackParamList, RootTabParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { SavedScreen } from '../screens/SavedScreen';
import { COLORS } from '../theme';
import { useSavedStore } from '../stores/savedStore';

const Stack = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

/**
 * Stack Navigator anidado para la pestaña de Catálogo (HomeStack).
 * Gestiona el flujo entre la lista principal (HomeScreen) y la ficha técnica (DetailScreen).
 */
const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.surfaceElevated,
        },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 17,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Catálogo de Instrumentos',
          headerShown: false, // HomeScreen maneja su propio encabezado con búsqueda
        }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{
          title: 'Ficha Técnica',
          headerBackTitle: 'Catálogo',
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Bottom Tab Navigator principal de la aplicación.
 * Tab 1 (HomeTab): Stack de Catálogo (Lista -> Detalle).
 * Tab 2 (SavedTab): Pantalla de elementos guardados con badge en tiempo real desde Zustand.
 */
const RootTabNavigator: React.FC = () => {
  // Consumo directo del conteo de favoritos desde Zustand para el badge del tab bar (sin prop drilling)
  const savedCount = useSavedStore((state) => state.savedItems.length);

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: COLORS.surfaceElevated,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.borderLight,
        },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: COLORS.surfaceElevated,
          borderTopWidth: 1,
          borderTopColor: COLORS.borderLight,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: COLORS.primaryLight,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'musical-notes' : 'musical-notes-outline';
          } else {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: 'Catálogo',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="SavedTab"
        component={SavedScreen}
        options={{
          title: 'Guardados',
          headerShown: false,
          tabBarBadge: savedCount > 0 ? savedCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.primary,
            color: COLORS.textInverse,
            fontSize: 10,
            fontWeight: '700',
            lineHeight: 14,
          },
        }}
      />
    </Tab.Navigator>
  );
};

// Tema oscuro sincronizado con nuestro Design System
const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: COLORS.background,
    card: COLORS.surfaceElevated,
    text: COLORS.textPrimary,
    border: COLORS.borderLight,
    primary: COLORS.primaryLight,
  },
};

/**
 * RootNavigator principal con NavigationContainer.
 */
export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer theme={navigationTheme}>
      <RootTabNavigator />
    </NavigationContainer>
  );
};

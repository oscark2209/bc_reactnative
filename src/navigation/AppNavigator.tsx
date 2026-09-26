// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, RootTabParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { COLORS } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

/**
 * Stack Navigator anidado para el Catálogo de Instrumentos.
 * Permite navegar desde la lista (HomeScreen) hacia la ficha detallada (DetailScreen).
 */
const CatalogStackNavigator: React.FC = () => {
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
          headerShown: false, // El HomeScreen ya incluye su propio banner estilizado
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
 * Tab 1: Catálogo con Stack Navigator anidado.
 * Tab 2: Directorio de Comunidad (Docentes y Estudiantes).
 */
const RootTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="CatalogTab"
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

          if (route.name === 'CatalogTab') {
            iconName = focused ? 'musical-notes' : 'musical-notes-outline';
          } else {
            iconName = focused ? 'people' : 'people-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="CatalogTab"
        component={CatalogStackNavigator}
        options={{
          title: 'Instrumentos',
          headerShown: false, // El stack interno gestiona sus propios encabezados
        }}
      />
      <Tab.Screen
        name="CommunityTab"
        component={CommunityScreen}
        options={{
          title: 'Comunidad',
          headerTitle: 'Comunidad Académica',
        }}
      />
    </Tab.Navigator>
  );
};

// Tema personalizado sincronizado con nuestro Design System oscuro
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
 * Componente principal de navegación que envuelve la jerarquía en NavigationContainer.
 */
export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer theme={navigationTheme}>
      <RootTabNavigator />
    </NavigationContainer>
  );
};

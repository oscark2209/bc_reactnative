// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { HomeStackParamList, RootTabParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { CreateScreen } from '../screens/CreateScreen';
import { EditScreen } from '../screens/EditScreen';
import { SavedScreen } from '../screens/SavedScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { COLORS } from '../theme';
import { useSavedStore } from '../stores/savedStore';

const Stack = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

/**
 * Stack Navigator anidado para la pestaña de Catálogo (HomeStack).
 * Gestiona el flujo entre la lista principal (HomeScreen), la ficha técnica (DetailScreen),
 * el formulario de alta en red (CreateScreen), edición y ajustes.
 */
export const HomeStackNavigator: React.FC = () => {
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
      <Stack.Screen
        name="Create"
        component={CreateScreen}
        options={{
          title: 'Nuevo Instrumento (POST)',
          headerBackTitle: 'Catálogo',
        }}
      />
      <Stack.Screen
        name="Edit"
        component={EditScreen}
        options={{
          title: 'Editar Instrumento (PUT/PATCH)',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Ajustes y Persistencia',
          headerBackTitle: 'Atrás',
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Bottom Tab Navigator principal para la aplicación autenticada (Semana 08).
 * Tab 1 (HomeTab): Stack de Catálogo (Lista -> Detalle -> Crear -> Editar).
 * Tab 2 (SavedTab): Elementos guardados con badge en tiempo real desde Zustand.
 * Tab 3 (ProfileTab): Perfil del usuario autenticado + datos del dominio y botón de logout.
 * Tab 4 (SettingsTab): Preferencias síncronas MMKV y caché offline.
 */
export const AppNavigator: React.FC = () => {
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
          } else if (route.name === 'SavedTab') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = focused ? 'settings' : 'settings-outline';
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
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: 'Ajustes',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

// src/navigation/types.ts
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, CompositeScreenProps, RouteProp } from '@react-navigation/native';
import { Instrument } from '../types';

/**
 * Parámetros de rutas para el Stack Navigator anidado (Catálogo -> Detalle).
 */
export type RootStackParamList = {
  Home: undefined;
  Detail: {
    instrument: Instrument;
  };
};

/**
 * Parámetros de rutas para el Bottom Tab Navigator principal.
 */
export type RootTabParamList = {
  CatalogTab: undefined;
  CommunityTab: undefined;
};

// ==========================================
// Tipos de Props para Pantallas del Stack
// ==========================================

export type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<RootStackParamList, 'Home'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type DetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<RootStackParamList, 'Detail'>,
  BottomTabScreenProps<RootTabParamList>
>;

// Tipos auxiliares para navegación y rutas individuales (useNavigation, useRoute)
export type HomeScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, 'Home'>,
  BottomTabNavigationProp<RootTabParamList>
>;

export type DetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Detail'>;
export type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;

// ==========================================
// Tipos de Props para Pantallas de Tabs
// ==========================================

export type CatalogTabScreenProps = BottomTabScreenProps<RootTabParamList, 'CatalogTab'>;
export type CommunityTabScreenProps = BottomTabScreenProps<RootTabParamList, 'CommunityTab'>;

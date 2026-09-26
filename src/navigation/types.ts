// src/navigation/types.ts
import type { NavigatorScreenParams, CompositeScreenProps, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Instrument } from '../types';

/**
 * Parámetros de rutas para el Stack Navigator anidado (HomeStack: Home -> Detail).
 */
export type HomeStackParamList = {
  Home: undefined;
  Detail: {
    instrument: Instrument;
  };
};

// Alias para compatibilidad con implementaciones previas
export type RootStackParamList = HomeStackParamList;

/**
 * Parámetros de rutas para el Bottom Tab Navigator principal.
 * Tab 1: HomeTab (contiene el HomeStackNavigator).
 * Tab 2: SavedTab (pantalla de instrumentos guardados/favoritos con Zustand).
 */
export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList> | undefined;
  SavedTab: undefined;
};

// ==========================================
// Tipos de Props Fuertemente Tipados
// ==========================================

export type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Home'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type DetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Detail'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type SavedScreenProps = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'SavedTab'>,
  NativeStackScreenProps<HomeStackParamList>
>;

export type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;
export type DetailScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Detail'>;
export type DetailScreenRouteProp = RouteProp<HomeStackParamList, 'Detail'>;

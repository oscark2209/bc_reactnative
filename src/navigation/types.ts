// src/navigation/types.ts
import type { NavigatorScreenParams, CompositeScreenProps, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Instrument } from '../types';

/**
 * Parámetros de rutas para el Stack de Autenticación (Semana 08).
 * Flujo no autenticado: Login y Registro.
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

/**
 * Parámetros de rutas para el Stack Navigator del Catálogo (Home, Detail, Create, Edit, Settings, Profile).
 */
export type HomeStackParamList = {
  Home: undefined;
  Detail: {
    instrument: Instrument;
  };
  Create: undefined;
  Edit: {
    id: string;
    instrument?: Instrument;
  };
  Settings: undefined;
};

// Alias de RootStackParamList
export type RootStackParamList = HomeStackParamList;

/**
 * Parámetros de rutas para el Bottom Tab Navigator principal (AppNavigator autenticado).
 */
export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList> | undefined;
  SavedTab: undefined;
  ProfileTab: undefined;
  SettingsTab: undefined;
};

// ==========================================
// Tipos de Props Fuertemente Tipados (Auth)
// ==========================================

export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;

// ==========================================
// Tipos de Props Fuertemente Tipados (App)
// ==========================================

export type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Home'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type DetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Detail'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type CreateScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Create'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type EditScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Edit'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type SavedScreenProps = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'SavedTab'>,
  NativeStackScreenProps<HomeStackParamList>
>;

export type ProfileScreenProps = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'ProfileTab'>,
  NativeStackScreenProps<HomeStackParamList>
>;

export type SettingsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Settings'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;
export type DetailScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Detail'>;
export type CreateScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Create'>;
export type EditScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Edit'>;
export type DetailScreenRouteProp = RouteProp<HomeStackParamList, 'Detail'>;
export type EditScreenRouteProp = RouteProp<HomeStackParamList, 'Edit'>;

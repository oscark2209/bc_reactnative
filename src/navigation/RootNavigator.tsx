// src/navigation/RootNavigator.tsx
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../stores/authStore';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { COLORS, SPACING, RADIUS } from '../theme';

// Tema oscuro institucional sincronizado con el Design System
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
 * Pantalla de carga / splash de inicio mientras se verifica el token en SecureStore
 */
const AuthLoadingSplash: React.FC = () => {
  return (
    <View style={styles.splashContainer}>
      <View style={styles.splashBadge}>
        <Ionicons name="musical-notes" size={40} color={COLORS.primaryLight} />
      </View>
      <Text style={styles.splashTitle}>Conservatorio de Música</Text>
      <Text style={styles.splashSubtitle}>Verificando credenciales en SecureStore...</Text>
      <ActivityIndicator size="large" color={COLORS.primaryLight} style={styles.spinner} />
    </View>
  );
};

/**
 * RootNavigator principal con navegación condicional (Semana 08).
 * Si el usuario no está autenticado, renderiza AuthNavigator (Login/Registro).
 * Si el usuario está autenticado, renderiza AppNavigator (Home/Detalle/Perfil/Ajustes).
 */
export const RootNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <NavigationContainer theme={navigationTheme}>
      {isLoading ? (
        <AuthLoadingSplash />
      ) : isAuthenticated ? (
        <AppNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  splashBadge: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    marginBottom: SPACING.md,
  },
  splashTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  splashSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  spinner: {
    marginTop: SPACING.sm,
  },
});

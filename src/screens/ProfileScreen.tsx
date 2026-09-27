// src/screens/ProfileScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../stores/authStore';
import { useSavedStore } from '../stores/savedStore';
import { COLORS, SPACING, RADIUS, SIZES, TYPOGRAPHY } from '../theme';
import { ProfileScreenProps } from '../navigation/types';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const savedCount = useSavedStore((state) => state.savedItems.length);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir del sistema del Conservatorio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const roleColor =
    user?.role === 'Coordinador'
      ? COLORS.primaryLight
      : user?.role === 'Profesor'
      ? COLORS.secondaryLight
      : COLORS.available;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View style={styles.header}>
          <View style={styles.headerTag}>
            <Text style={styles.headerTagText}>CONSERVATORIO ACADÉMICO</Text>
          </View>
          <Text style={styles.headerTitle}>Perfil del Músico</Text>
          <Text style={styles.headerSubtitle}>
            Gestión de credenciales y estado institucional en la Escuela de Música.
          </Text>
        </View>

        {/* Tarjeta de Identidad del Usuario */}
        <View style={styles.identityCard}>
          <View style={styles.identityTopRow}>
            {user?.image ? (
              <Image source={{ uri: user.image }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="person" size={36} color={COLORS.primaryLight} />
              </View>
            )}

            <View style={styles.identityDetails}>
              <View style={[styles.roleBadge, { backgroundColor: roleColor + '22', borderColor: roleColor }]}>
                <Text style={[styles.roleBadgeText, { color: roleColor }]}>
                  {user?.role || 'Estudiante'}
                </Text>
              </View>
              <Text style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.userHandle}>@{user?.username || 'usuario'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'correo@conservatorio.edu.co'}</Text>
            </View>
          </View>

          {/* Matrícula y Especialidad Musical */}
          <View style={styles.domainInfoGrid}>
            <View style={styles.domainItem}>
              <Ionicons name="barcode-outline" size={16} color={COLORS.primaryLight} />
              <View>
                <Text style={styles.domainLabel}>Matrícula</Text>
                <Text style={styles.domainValue}>{user?.matricula || 'MUS-2026-ACT'}</Text>
              </View>
            </View>

            <View style={styles.domainItem}>
              <Ionicons name="musical-notes-outline" size={16} color={COLORS.secondaryLight} />
              <View>
                <Text style={styles.domainLabel}>Cátedra / Especialidad</Text>
                <Text style={styles.domainValue}>
                  {user?.instrumentSpecialty || 'Cuerdas / Violín Sinfónico'}
                </Text>
              </View>
            </View>

            <View style={styles.domainItem}>
              <Ionicons name="ribbon-outline" size={16} color={COLORS.available} />
              <View>
                <Text style={styles.domainLabel}>Nivel de Dominio</Text>
                <Text style={styles.domainValue}>{user?.academicLevel || 'Avanzado'}</Text>
              </View>
            </View>

            <View style={styles.domainItem}>
              <Ionicons name="bookmark-outline" size={16} color={COLORS.primaryLight} />
              <View>
                <Text style={styles.domainLabel}>Favoritos en Estudio</Text>
                <Text style={styles.domainValue}>{savedCount} instrumentos</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sección de Reservas Activas del Estudiante */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="time-outline" size={18} color={COLORS.primaryLight} />
            <Text style={styles.sectionTitle}>Préstamos y Aulas Asignadas</Text>
          </View>
          <View style={styles.reservationItem}>
            <View style={styles.reservationDot} />
            <View style={styles.reservationContent}>
              <Text style={styles.reservationItemTitle}>Violonchelo Stentor Master 4/4</Text>
              <Text style={styles.reservationItemSubtitle}>
                Aula 204 — Cuerdas Frotadas • Préstamo activo hasta fin de semestre
              </Text>
            </View>
            <View style={styles.reservationStatusPill}>
              <Text style={styles.reservationStatusText}>Activo</Text>
            </View>
          </View>

          <View style={styles.reservationItem}>
            <View style={[styles.reservationDot, { backgroundColor: COLORS.secondary }]} />
            <View style={styles.reservationContent}>
              <Text style={styles.reservationItemTitle}>Cabina de Ensayo Acústico 03</Text>
              <Text style={styles.reservationItemSubtitle}>
                Lunes y Miércoles 14:00 - 17:00 • Práctica Individual
              </Text>
            </View>
            <View style={styles.reservationStatusPill}>
              <Text style={styles.reservationStatusText}>Programado</Text>
            </View>
          </View>
        </View>

        {/* Arquitectura de Seguridad (Semana 08) */}
        <View style={styles.securityCard}>
          <View style={styles.securityHeaderRow}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.available} />
            <Text style={styles.securityTitle}>Seguridad de la Sesión (JWT + SecureStore)</Text>
          </View>
          <Text style={styles.securityDesc}>
            • Access Token y Refresh Token resguardados exclusivamente en el llavero nativo mediante{' '}
            <Text style={styles.boldText}>Expo SecureStore</Text>.{'\n'}
            • Persistencia selectiva con <Text style={styles.boldText}>Zustand partialize</Text>: los
            tokens nunca tocan AsyncStorage o MMKV sin cifrar.{'\n'}
            • Auto-renovación silenciosa con interceptor Axios ante respuestas 401.
          </Text>
        </View>

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.8}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={COLORS.maintenanceText} />
          ) : (
            <View style={styles.logoutButtonRow}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.maintenanceText} />
              <Text style={styles.logoutButtonText}>Cerrar Sesión Segura</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    marginBottom: SPACING.md,
  },
  headerTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryDark + '33',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primaryLight + '55',
    marginBottom: SPACING.xs,
  },
  headerTagText: {
    color: COLORS.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  identityCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
  },
  identityTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  avatarFallback: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  identityDetails: {
    flex: 1,
    gap: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginBottom: 4,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  userHandle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  domainInfoGrid: {
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  domainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  domainLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  domainValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sectionCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  reservationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  reservationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.available,
  },
  reservationContent: {
    flex: 1,
  },
  reservationItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  reservationItemSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  reservationStatusPill: {
    backgroundColor: COLORS.available + '22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  reservationStatusText: {
    fontSize: 10,
    color: COLORS.available,
    fontWeight: '700',
  },
  securityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  securityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  securityDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  boldText: {
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: COLORS.maintenance + '18',
    borderWidth: 1.5,
    borderColor: COLORS.maintenance,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logoutButtonText: {
    color: COLORS.maintenanceText,
    fontSize: 15,
    fontWeight: '700',
  },
});

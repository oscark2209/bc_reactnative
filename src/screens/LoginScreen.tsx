// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';

import { loginSchema, LoginFormData } from '../schemas/authSchema';
import { useAuthStore } from '../stores/authStore';
import { FormField } from '../components/FormField';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SIZES } from '../theme';
import { LoginScreenProps } from '../navigation/types';

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const login = useAuthStore((state) => state.login);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setLocalError(null);
    clearError();
    try {
      await login(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar con el servidor de autenticación.';
      setLocalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (username: string, pass: string) => {
    setValue('username', username, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    setLocalError(null);
    clearError();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo & Encabezado Institucional */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="musical-notes" size={32} color={COLORS.primaryLight} />
            </View>
            <View style={styles.institutionTag}>
              <Text style={styles.institutionTagText}>CONSERVATORIO ACADÉMICO</Text>
            </View>
            <Text style={styles.title}>Iniciar Sesión</Text>
            <Text style={styles.subtitle}>
              Accede al sistema de inventario y reserva de instrumentos con tus credenciales seguras.
            </Text>
          </View>

          {/* Banner de Error si ocurre fallo en autenticación */}
          {(localError || authError) && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color={COLORS.maintenance} />
              <Text style={styles.errorBannerText}>{localError || authError}</Text>
            </View>
          )}

          {/* Formulario */}
          <View style={styles.formCard}>
            <FormField<LoginFormData>
              control={control}
              name="username"
              label="Nombre de Usuario"
              placeholder="Ej: emilys o tu usuario institucional"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <FormField<LoginFormData>
              control={control}
              name="password"
              label="Contraseña"
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
            />

            {/* Botón de Submit */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={COLORS.textInverse} />
                  <Text style={styles.submitButtonText}>Verificando credenciales...</Text>
                </View>
              ) : (
                <View style={styles.buttonRow}>
                  <Ionicons name="log-in-outline" size={20} color={COLORS.textInverse} />
                  <Text style={styles.submitButtonText}>Ingresar al Conservatorio</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Chips de Credenciales de Prueba Rápidas */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>💡 Credenciales de demostración rápida:</Text>
            <View style={styles.chipsRow}>
              <TouchableOpacity
                style={styles.demoChip}
                onPress={() => handleFillDemo('emilys', 'emilyspass')}
                activeOpacity={0.7}
              >
                <Ionicons name="person-circle-outline" size={14} color={COLORS.primaryLight} />
                <Text style={styles.demoChipText}>DummyJSON (emilys)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoChip}
                onPress={() => handleFillDemo('estudiante_musica', 'musica2026')}
                activeOpacity={0.7}
              >
                <Ionicons name="school-outline" size={14} color={COLORS.available} />
                <Text style={styles.demoChipText}>Alumno Demo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoChip}
                onPress={() => handleFillDemo('profesor_fernando', 'conservatorio123')}
                activeOpacity={0.7}
              >
                <Ionicons name="briefcase-outline" size={14} color={COLORS.secondaryLight} />
                <Text style={styles.demoChipText}>Profesor Demo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Enlace para Registro */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>¿No tienes cuenta en el conservatorio? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Regístrate aquí</Text>
            </TouchableOpacity>
          </View>

          {/* Aviso de Seguridad de Tokens */}
          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.securityNoteText}>
              Tokens JWT protegidos exclusivamente en hardware mediante Expo SecureStore.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  institutionTag: {
    backgroundColor: COLORS.primaryDark + '33',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primaryLight + '55',
    marginBottom: SPACING.sm,
  },
  institutionTagText: {
    color: COLORS.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: SPACING.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.maintenance + '22',
    borderWidth: 1,
    borderColor: COLORS.maintenance + '66',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  errorBannerText: {
    flex: 1,
    color: COLORS.maintenanceText,
    fontSize: 12,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: SPACING.md,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  submitButtonText: {
    color: COLORS.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
  demoSection: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  demoChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  registerLink: {
    color: COLORS.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: SPACING.lg,
  },
  securityNoteText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

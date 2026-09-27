// src/screens/RegisterScreen.tsx
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';

import { registerSchema, RegisterFormData } from '../schemas/authSchema';
import { CATEGORIES, LEVELS } from '../schemas/itemSchema';
import { useAuthStore } from '../stores/authStore';
import { FormField } from '../components/FormField';
import { COLORS, SPACING, RADIUS, SIZES, TYPOGRAPHY } from '../theme';
import { RegisterScreenProps } from '../navigation/types';

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const registerUser = useAuthStore((state) => state.register);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      instrumentInterest: 'Cuerdas',
      academicLevel: 'Iniciación',
    },
    mode: 'onTouched',
  });

  const selectedCategory = watch('instrumentInterest');
  const selectedLevel = watch('academicLevel');

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setLocalError(null);
    clearError();
    try {
      await registerUser(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar la matrícula de estudiante.';
      setLocalError(msg);
    } finally {
      setIsSubmitting(false);
    }
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
          {/* Botón Volver a Login */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
            <Text style={styles.backButtonText}>Volver a Iniciar Sesión</Text>
          </TouchableOpacity>

          {/* Encabezado */}
          <View style={styles.header}>
            <View style={styles.badgeRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>NUEVA MATRÍCULA</Text>
              </View>
            </View>
            <Text style={styles.title}>Registro de Estudiante</Text>
            <Text style={styles.subtitle}>
              Crea tu perfil institucional para reservar aulas y solicitar instrumentos del conservatorio.
            </Text>
          </View>

          {/* Error Banner */}
          {(localError || authError) && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color={COLORS.maintenance} />
              <Text style={styles.errorBannerText}>{localError || authError}</Text>
            </View>
          )}

          {/* Formulario */}
          <View style={styles.formCard}>
            <FormField<RegisterFormData>
              control={control}
              name="fullName"
              label="Nombre Completo"
              placeholder="Ej: Sofía Morales Valencia"
              autoCapitalize="words"
            />

            <FormField<RegisterFormData>
              control={control}
              name="username"
              label="Nombre de Usuario"
              placeholder="Ej: sofia_cello"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <FormField<RegisterFormData>
              control={control}
              name="email"
              label="Correo Electrónico"
              placeholder="sofia@conservatorio.edu.co"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <FormField<RegisterFormData>
              control={control}
              name="password"
              label="Contraseña"
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              autoCapitalize="none"
            />

            {/* Selector de Cátedra / Interés Instrumental */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Cátedra / Familia Instrumental</Text>
              <View style={styles.chipsContainer}>
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setValue('instrumentInterest', cat, { shouldValidate: true })}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isSelected ? 'checkmark-circle' : 'musical-note-outline'}
                        size={14}
                        color={isSelected ? COLORS.textInverse : COLORS.textMuted}
                      />
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.instrumentInterest && (
                <Text style={styles.fieldError}>{errors.instrumentInterest.message}</Text>
              )}
            </View>

            {/* Selector de Nivel Académico */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Nivel Académico de Ingreso</Text>
              <View style={styles.chipsContainer}>
                {LEVELS.map((lvl) => {
                  const isSelected = selectedLevel === lvl;
                  return (
                    <TouchableOpacity
                      key={lvl}
                      style={[styles.chip, isSelected && styles.chipActiveLevel]}
                      onPress={() => setValue('academicLevel', lvl, { shouldValidate: true })}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isSelected ? 'ribbon' : 'ribbon-outline'}
                        size={14}
                        color={isSelected ? COLORS.textInverse : COLORS.textMuted}
                      />
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {lvl}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.academicLevel && (
                <Text style={styles.fieldError}>{errors.academicLevel.message}</Text>
              )}
            </View>

            {/* Botón de Registro */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <View style={styles.buttonRow}>
                  <ActivityIndicator size="small" color={COLORS.textInverse} />
                  <Text style={styles.submitButtonText}>Generando matrícula...</Text>
                </View>
              ) : (
                <View style={styles.buttonRow}>
                  <Ionicons name="checkmark-done" size={20} color={COLORS.textInverse} />
                  <Text style={styles.submitButtonText}>Completar Registro</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Enlace para volver */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>¿Ya tienes matrícula activa? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Iniciar Sesión</Text>
            </TouchableOpacity>
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
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    marginBottom: SPACING.md,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  tag: {
    backgroundColor: COLORS.primaryDark + '33',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primaryLight + '55',
  },
  tagText: {
    color: COLORS.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
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
  fieldSection: {
    gap: SPACING.xs,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  chipActiveLevel: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondaryLight,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  fieldError: {
    fontSize: 12,
    color: COLORS.maintenanceText,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  submitButtonText: {
    color: COLORS.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  loginLink: {
    color: COLORS.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
});

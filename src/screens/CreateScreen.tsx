// src/screens/CreateScreen.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Resolver, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { itemSchema, ItemFormData, CATEGORIES, LEVELS } from '../schemas/itemSchema';
import { FormField } from '../components/FormField';
import { useCreateItem } from '../hooks/useItems';
import { CreateScreenProps } from '../navigation/types';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SIZES } from '../theme';

export const CreateScreen: React.FC<CreateScreenProps> = ({ navigation }) => {
  // Inicialización de React Hook Form con resolver estricto de Zod
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema) as Resolver<ItemFormData>,
    defaultValues: {
      name: '',
      category: 'Cuerdas',
      level: 'Intermedio',
      priceCOP: 3500000,
      roomLocation: '',
      description: '',
      imageUrl: '',
    },
  });

  const selectedCategory = watch('category');
  const selectedLevel = watch('level');

  // Mutación de TanStack Query v5
  const createMutation = useCreateItem();

  const onSubmit: SubmitHandler<ItemFormData> = async (data) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        category: data.category,
        level: data.level,
        priceCOP: Number(data.priceCOP),
        roomLocation: data.roomLocation,
        description: data.description,
        imageUrl: data.imageUrl || undefined,
        status: 'Disponible',
      });

      Alert.alert(
        'Instrumento Creado',
        `"${data.name}" fue validado con Zod y registrado en la API con éxito.`,
        [
          {
            text: 'Ver en Catálogo',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al registrar el instrumento en la API';
      Alert.alert('Error de Red', errorMsg);
    }
  };

  const isBusy = isSubmitting || createMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Banner Informativo */}
        <View style={styles.banner}>
          <View style={styles.bannerTag}>
            <Text style={styles.bannerTagText}>REACT HOOK FORM + ZOD</Text>
          </View>
          <Text style={styles.bannerTitle}>Alta de Instrumento Musical</Text>
          <Text style={styles.bannerSubtitle}>
            Validación de tipos en tiempo real. Al enviar, TanStack Query invalidará la caché automáticamente.
          </Text>
        </View>

        {/* Campo Reutilizable: Nombre */}
        <FormField
          control={control}
          name="name"
          label="Nombre del Instrumento *"
          placeholder="ej. Clarinete Bajo Selmer Privilege"
        />

        {/* Selector de Categoría mediante Chips */}
        <View style={styles.selectorGroup}>
          <Text style={styles.groupLabel}>Categoría del Instrumento *</Text>
          <View style={styles.chipsRow}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setValue('category', cat, { shouldValidate: true })}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.category && (
            <Text style={styles.errorText}>{errors.category.message}</Text>
          )}
        </View>

        {/* Selector de Nivel mediante Chips */}
        <View style={styles.selectorGroup}>
          <Text style={styles.groupLabel}>Nivel de Técnica Académica *</Text>
          <View style={styles.chipsRow}>
            {LEVELS.map((lvl) => {
              const isSelected = selectedLevel === lvl;
              return (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setValue('level', lvl, { shouldValidate: true })}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {lvl}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.level && (
            <Text style={styles.errorText}>{errors.level.message}</Text>
          )}
        </View>

        {/* Campo Reutilizable: Precio */}
        <FormField
          control={control}
          name="priceCOP"
          label="Valor Comercial Estimado (COP) *"
          placeholder="ej. 4800000"
          isNumeric
          keyboardType="numeric"
          helperText="Mínimo $50.000 COP sin puntos ni comas"
        />

        {/* Campo Reutilizable: Ubicación */}
        <FormField
          control={control}
          name="roomLocation"
          label="Ubicación o Aula en Campus *"
          placeholder="ej. Aula 108 - Cátedra de Vientos"
        />

        {/* Campo Reutilizable: URL de Imagen */}
        <FormField
          control={control}
          name="imageUrl"
          label="URL de Imagen (Opcional)"
          placeholder="https://images.unsplash.com/..."
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Campo Reutilizable: Descripción */}
        <FormField
          control={control}
          name="description"
          label="Descripción Técnica y Luthería *"
          placeholder="Mínimo 10 caracteres detallando maderas, afinación o componentes..."
          multiline
          numberOfLines={4}
        />

        {/* Botón de Envío */}
        <TouchableOpacity
          style={[styles.submitButton, isBusy && styles.submitButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isBusy}
          activeOpacity={0.8}
        >
          {isBusy ? (
            <ActivityIndicator color={COLORS.textInverse} size="small" />
          ) : (
            <View style={styles.buttonContent}>
              <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.textInverse} />
              <Text style={styles.submitButtonText}>Registrar con React Hook Form</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Botón de Cancelar */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Cancelar y Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  banner: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.borderLight,
    gap: SPACING.xs,
  },
  bannerTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.badgeCategoryBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xs,
  },
  bannerTagText: {
    ...TYPOGRAPHY.headerTag,
    color: COLORS.badgeCategoryText,
  },
  bannerTitle: {
    ...TYPOGRAPHY.headerTitle,
    fontSize: 18,
  },
  bannerSubtitle: {
    ...TYPOGRAPHY.headerSubtitle,
    fontSize: 12,
  },
  selectorGroup: {
    gap: SPACING.xs,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.sm,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.maintenanceText,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  cancelButtonText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});

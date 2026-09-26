// src/screens/CreateScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CreateScreenProps } from '../navigation/types';
import { InstrumentCategory, SkillLevel, CreateInstrumentInput } from '../types';
import { useCreateItem } from '../hooks/useCreateItem';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SIZES } from '../theme';

const CATEGORIES: InstrumentCategory[] = [
  'Cuerdas',
  'Viento-Madera',
  'Viento-Metal',
  'Percusión',
  'Teclados',
];

const LEVELS: SkillLevel[] = [
  'Iniciación',
  'Intermedio',
  'Avanzado',
  'Profesional',
];

export const CreateScreen: React.FC<CreateScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InstrumentCategory>('Cuerdas');
  const [level, setLevel] = useState<SkillLevel>('Intermedio');
  const [price, setPrice] = useState('');
  const [roomLocation, setRoomLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Hook de mutación con TanStack Query v5
  const createMutation = useCreateItem();

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa el nombre del instrumento.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Campo requerido', 'Por favor describe las características del instrumento.');
      return;
    }

    const priceNum = Number(price.replace(/[^0-9]/g, '')) || 3000000;

    const payload: CreateInstrumentInput = {
      name: name.trim(),
      category,
      level,
      priceCOP: priceNum,
      roomLocation: roomLocation.trim() || 'Aula General',
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
      status: 'Disponible',
    };

    try {
      await createMutation.mutateAsync(payload);

      Alert.alert(
        'Instrumento Creado',
        `"${payload.name}" ha sido registrado exitosamente en la API REST y la caché se ha actualizado.`,
        [
          {
            text: 'Ver Catálogo',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error desconocido al crear el registro.';
      Alert.alert('Error de Red', `No se pudo registrar el instrumento: ${errorMsg}`);
    }
  };

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
        {/* Banner de Introducción */}
        <View style={styles.banner}>
          <View style={styles.bannerTag}>
            <Text style={styles.bannerTagText}>PETICIÓN POST CON AXIOS</Text>
          </View>
          <Text style={styles.bannerTitle}>Registrar Nuevo Instrumento</Text>
          <Text style={styles.bannerSubtitle}>
            Los datos se enviarán a la API REST e invalidarán la caché de TanStack Query para reflejarse automáticamente en el catálogo.
          </Text>
        </View>

        {/* Campo: Nombre */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre del Instrumento *</Text>
          <TextInput
            style={styles.input}
            placeholder="ej. Oboe Francés Marigaux 901"
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Selector de Categoría (Chips) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Categoría *</Text>
          <View style={styles.chipsRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, category === cat && styles.chipActive]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.chipText, category === cat && styles.chipTextActive]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selector de Nivel Pedagógico (Chips) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nivel de Técnica *</Text>
          <View style={styles.chipsRow}>
            {LEVELS.map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={[styles.chip, level === lvl && styles.chipActive]}
                onPress={() => setLevel(lvl)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.chipText, level === lvl && styles.chipTextActive]}
                >
                  {lvl}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Campo: Valor Estimado */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Valor Comercial Estimado (COP)</Text>
          <TextInput
            style={styles.input}
            placeholder="ej. 5200000"
            placeholderTextColor={COLORS.textMuted}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
        </View>

        {/* Campo: Ubicación en Campus */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Ubicación en el Conservatorio</Text>
          <TextInput
            style={styles.input}
            placeholder="ej. Aula 106 - Cátedra de Vientos"
            placeholderTextColor={COLORS.textMuted}
            value={roomLocation}
            onChangeText={setRoomLocation}
          />
        </View>

        {/* Campo: URL de Imagen Opcional */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>URL de Imagen (Opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://..."
            placeholderTextColor={COLORS.textMuted}
            value={imageUrl}
            onChangeText={setImageUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Campo: Descripción Técnica */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Descripción y Características *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detalles sobre luthería, afinación, componentes o requerimientos especiales..."
            placeholderTextColor={COLORS.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Botón de Envío POST */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            createMutation.isPending && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={createMutation.isPending}
          activeOpacity={0.8}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color={COLORS.textInverse} size="small" />
          ) : (
            <View style={styles.buttonContent}>
              <Ionicons name="cloud-upload-outline" size={18} color={COLORS.textInverse} />
              <Text style={styles.submitButtonText}>Registrar en la API</Text>
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
  formGroup: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    height: SIZES.searchInputHeight,
    borderRadius: RADIUS.md,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.border,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    paddingTop: SPACING.sm,
    textAlignVertical: 'top',
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
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 48,
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

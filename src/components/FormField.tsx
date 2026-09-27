// src/components/FormField.tsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { COLORS, SPACING, RADIUS, SIZES, TYPOGRAPHY } from '../theme';

interface FormFieldProps<T extends FieldValues>
  extends Omit<TextInputProps, 'defaultValue'> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
  helperText?: string;
  isNumeric?: boolean;
}

/**
 * Componente de campo de formulario reutilizable y genérico.
 * Encapsula Controller de React Hook Form, TextInput nativo y la visualización condicional de errores.
 */
export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  containerStyle,
  helperText,
  isNumeric = false,
  ...textInputProps
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => {
        const stringValue =
          value !== undefined && value !== null
            ? isNumeric && (value === 0 || value === '')
              ? ''
              : String(value)
            : '';

        const handleChangeText = (text: string) => {
          if (isNumeric) {
            // Filtrado de dígitos para inputs de tipo moneda/numérico
            const cleaned = text.replace(/[^0-9]/g, '');
            onChange(cleaned === '' ? 0 : Number(cleaned));
          } else {
            onChange(text);
          }
        };

        return (
          <View style={[styles.container, containerStyle]}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={[
                styles.input,
                error ? styles.inputError : undefined,
                textInputProps.multiline ? styles.inputMultiline : undefined,
              ]}
              placeholderTextColor={COLORS.textMuted}
              onBlur={onBlur}
              onChangeText={handleChangeText}
              value={stringValue}
              {...textInputProps}
            />
            {error ? (
              <Text style={styles.errorText}>{error.message}</Text>
            ) : helperText ? (
              <Text style={styles.helperText}>{helperText}</Text>
            ) : null}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
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
  inputError: {
    borderColor: COLORS.maintenance,
    borderWidth: 1.5,
  },
  inputMultiline: {
    height: 100,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.maintenanceText,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});

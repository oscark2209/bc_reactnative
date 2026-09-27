// src/schemas/itemSchema.ts
import { z } from 'zod';

export const CATEGORIES = [
  'Cuerdas',
  'Viento-Madera',
  'Viento-Metal',
  'Percusión',
  'Teclados',
] as const;

export const LEVELS = [
  'Iniciación',
  'Intermedio',
  'Avanzado',
  'Profesional',
] as const;

/**
 * Esquema de validación estricto con Zod para instrumentos musicales.
 * Totalmente compatible con todas las versiones de Zod (métodos de validación encadenados).
 */
export const itemSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe contener al menos 3 caracteres')
    .max(80, 'El nombre no puede superar los 80 caracteres'),

  category: z.enum(CATEGORIES),

  level: z.enum(LEVELS),

  priceCOP: z
    .number()
    .positive('El valor comercial debe ser mayor a 0 COP')
    .min(50000, 'El valor mínimo registrado es $50.000 COP'),

  roomLocation: z
    .string()
    .min(3, 'La ubicación en campus debe tener al menos 3 caracteres'),

  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción técnica no puede exceder 500 caracteres'),

  imageUrl: z
    .string()
    .url('Debe ser una URL válida')
    .optional()
    .or(z.literal('')),
});

/**
 * Tipo inferido estrictamente a partir del esquema Zod
 */
export type ItemFormData = z.infer<typeof itemSchema>;

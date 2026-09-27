// src/schemas/authSchema.ts
import { z } from 'zod';
import { CATEGORIES, LEVELS } from './itemSchema';

/**
 * Esquema de validación Zod para el formulario de Inicio de Sesión
 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'El nombre de usuario debe contener al menos 3 caracteres')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres'),
  password: z
    .string()
    .min(4, 'La contraseña debe contener al menos 4 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Esquema de validación Zod para el formulario de Registro en el Conservatorio
 */
export const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, 'El nombre completo debe contener al menos 3 caracteres')
    .max(80, 'El nombre no puede exceder 80 caracteres'),
  username: z
    .string()
    .min(3, 'El nombre de usuario debe contener al menos 3 caracteres')
    .max(30, 'El nombre de usuario no puede superar 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo se permiten letras, números y guiones bajos'),
  email: z
    .string()
    .email('Debe ingresar un correo electrónico institucional o personal válido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  instrumentInterest: z.enum(CATEGORIES),
  academicLevel: z.enum(LEVELS),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

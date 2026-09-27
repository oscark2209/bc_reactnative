// src/types/index.ts

export type InstrumentCategory =
  | 'Cuerdas'
  | 'Viento-Madera'
  | 'Viento-Metal'
  | 'Percusión'
  | 'Teclados';

export type SkillLevel =
  | 'Iniciación'
  | 'Intermedio'
  | 'Avanzado'
  | 'Profesional';

export type InstrumentStatus =
  | 'Disponible'
  | 'En préstamo'
  | 'En mantenimiento'
  | 'Asignado';

export interface Teacher {
  id: string;
  name: string;
  specialty: string;
  department: string;
}

export interface Student {
  id: string;
  name: string;
  level: SkillLevel;
  matricula: string;
}

export interface Instrument {
  id: string;
  name: string;
  category: InstrumentCategory;
  level: SkillLevel;
  status: InstrumentStatus;
  imageUrl: string;
  description: string;
  roomLocation: string;
  priceCOP: number;
  responsibleTeacher: Teacher;
  assignedStudent?: Student;
}

// Alias de dominio
export type Item = Instrument;

/**
 * Payload para la creación de un nuevo instrumento mediante POST con Axios
 */
export interface CreateInstrumentInput {
  name: string;
  category: InstrumentCategory;
  level: SkillLevel;
  priceCOP: number;
  description: string;
  roomLocation: string;
  imageUrl?: string;
  status?: InstrumentStatus;
}

export type CreateItemPayload = CreateInstrumentInput;

/**
 * Payload para la actualización de un instrumento existente mediante PUT/PATCH con Axios
 */
export type UpdateItemPayload = Partial<CreateInstrumentInput>;

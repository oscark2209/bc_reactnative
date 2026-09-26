// src/types/index.ts

export type InstrumentFamily =
  | 'Cuerda'
  | 'Viento-Madera'
  | 'Viento-Metal'
  | 'Percusión'
  | 'Teclado';

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
  email: string;
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
  family: InstrumentFamily;
  level: SkillLevel;
  status: InstrumentStatus;
  imageUrl: string;
  description: string;
  roomLocation: string;
  responsibleTeacher: Teacher;
  assignedStudent?: Student;
}
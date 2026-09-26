# Proyecto Semana 01 — App de Escuela de Música con Core Components y Flexbox

## Descripción
En esta semana se construyó una aplicación móvil con los componentes fundamentales de React Native y maquetación 100% con Flexbox. La aplicación presenta el catálogo oficial de la **Escuela de Música**, permitiendo consultar el inventario de instrumentos musicales, sus niveles pedagógicos, salas asignadas y los profesores o estudiantes vinculados a cada cátedra en un diseño moderno, modular y adaptable.

El proyecto fue realizado utilizando **React Native**, **Expo**, **TypeScript** y **pnpm**.

---

## Mi dominio
El dominio asignado para este proyecto es **Escuela de Música**.

El modelo de datos cuenta con tres entidades tipadas en TypeScript (`Instrument`, `Teacher`, `Student`) que se relacionan entre sí:

- **Instrumento (`Instrument`):** Nombre, familia instrumental, nivel requerido, estado de conservación/disponibilidad, imagen representativa en alta resolución, descripción técnica y aula asignada.
- **Profesor (`Teacher`):** Docente a cargo de la cátedra, especialidad y departamento.
- **Estudiante (`Student`):** Alumno que tiene asignado o en préstamo el instrumento, con nivel y matrícula.

### Instrumentos incluidos en el catálogo:
1. **Piano de Cola Yamaha C3X** (Teclado • Nivel Avanzado • Disponible • Mtra. Clara Schumann • Aula 201 - Auditorio Principal)
2. **Violín de Concierto 4/4** (Cuerda • Nivel Intermedio • Asignado a Sofía Ramírez • Prof. Andrés Segovia • Aula 104)
3. **Saxofón Alto Yamaha YAS-280** (Viento-Madera • Nivel Iniciación • Disponible • Mtro. Miles Davis • Aula 108)
4. **Batería Acústica Pearl Export** (Percusión • Nivel Intermedio • En préstamo a Mateo Hernández • Prof. Evelyn Glennie • Cabina 005)
5. **Violonchelo Stentor Student II** (Cuerda • Nivel Iniciación • Disponible • Prof. Andrés Segovia • Asignado a Valentina Gómez)
6. **Trompeta en Sib Bach Stradivarius** (Viento-Metal • Nivel Profesional • En mantenimiento • Mtro. Miles Davis • Taller de Luthería)

---

## Pantalla principal (HomeScreen)
La pantalla principal cuenta con:

- **Encabezado institucional:** Muestra el distintivo del conservatorio, el nombre del dominio (**"Escuela de Música"**) y una descripción de su propósito académico.
- **Barra de métricas dinámicas:** Panel en Flexbox que resume el total de instrumentos registrados, cuántos están disponibles para práctica y cuántos se encuentran actualmente en uso o préstamo.
- **Catálogo interactivo con ScrollView:** Lista vertical fluida con todas las tarjetas de instrumentos.
- **Tarjetas personalizadas (`ItemCard`):** Muestran la fotografía del instrumento, etiquetas visuales por familia y nivel, badge dinámico según el estado (`Disponible`, `En préstamo`, `Asignado`, `En mantenimiento`), descripción y panel de metadatos institucionales.
- **Acción táctil con feedback visual:** Botón interactivo implementado con `Pressable` que cambia de tono y opacidad al presionarse (`pressed`), activando una alerta nativa con la ficha técnica detallada del instrumento.

---

## Diseño y Restricciones Técnicas
- **Estilo visual:** Modo oscuro sofisticado (*Dark slate/navy*) con paleta armónica inspirada en acabados de instrumentos clásicos y modernos, con acentos en índigo, verde esmeralda y ámbar.
- **100% Flexbox:** Maquetación sin utilizar `position: 'absolute'`. Todos los alineamientos, espaciados y distribuciones se lograron mediante `flexDirection`, `alignItems`, `justifyContent`, `flexWrap` y `gap`.
- **Cero estilos inline:** Cumplimiento estricto de la regla de no usar `style={{ ... }}` en el JSX; todos los estilos están declarados en `StyleSheet.create`.
- **Componentes Core nativos:** Sin dependencias de librerías visuales externas; uso exclusivo de `View`, `Text`, `Image`, `ScrollView`, `Pressable` y `StyleSheet`.

---

## 📂 Estructura de proyecto
```text
starter/
├── src/
│   ├── components/
│   │   └── ItemCard.tsx       # Componente modular reutilizable de tarjeta con Pressable
│   ├── data/
│   │   └── mockData.ts        # Datos de ejemplo tipados (Instrumentos, Profesores y Estudiantes)
│   ├── screens/
│   │   └── HomeScreen.tsx     # Pantalla principal con Header, estadísticas y ScrollView
│   └── types/
│       └── index.ts           # Interfaces de TypeScript (Instrument, Teacher, Student)
│
├── app.json                   # Configuración de Expo con el dominio "Escuela de Música"
├── App.tsx                    # Punto de entrada de la aplicación con StatusBar
├── package.json               # Dependencias y scripts del proyecto
├── pnpm-lock.yaml             # Bloqueo de versiones para pnpm
├── README.md                  # Documentación del proyecto
└── tsconfig.json              # Configuración estricta de TypeScript
```

---

## ⚙️ Cómo ejecutar el proyecto con pnpm

1. **Abrir la terminal e ingresar a la carpeta del proyecto:**
   ```bash
   cd week-01-core_components_y_flexbox/proyecto/starter
   ```

2. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

3. **Iniciar en navegador Web:**
   ```bash
   pnpm web
   ```

4. **Iniciar el servidor de desarrollo Expo (Metro Bundler):**
   ```bash
   pnpm start
   ```
   *Escanea el código QR desde tu dispositivo móvil con la app **Expo Go** (Android / iOS).*

5. **Validación de tipos de TypeScript:**
   ```bash
   pnpm exec tsc --noEmit
   ```

---

## ✅ Entregables y Requisitos Cumplidos
- [x] Creación de proyecto Expo con configuración estricta de TypeScript.
- [x] Definición de entidades del dominio en `src/types/index.ts` (`Instrument`, `Student`, `Teacher`).
- [x] Mínimo 4 elementos tipados en `src/data/mockData.ts` (6 instrumentos completos con relaciones).
- [x] Uso exclusivo de Core Components: `View`, `Text`, `Image`, `ScrollView` y `Pressable`.
- [x] Maquetación responsiva 100% mediante Flexbox (sin `position: 'absolute'`).
- [x] Cero estilos inline en JSX (uso estricto de `StyleSheet.create`).
- [x] Componente modular reutilizable `ItemCard` con imágenes nativas y estilos diferenciados de texto.
- [x] Feedback visual interactivo al pulsar (`pressed` en `Pressable`).
- [x] Header superior identificando claramente el dominio ("Escuela de Música").
- [x] Flujo de trabajo y comandos adaptados para **pnpm**.

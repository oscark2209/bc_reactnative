import React, { useLayoutEffect, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DetailScreenRouteProp, DetailScreenNavigationProp } from '../navigation/types';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SIZES } from '../theme';
import { Instrument } from '../types';
import { useSavedStore } from '../stores/savedStore';
import { ProgressBar } from '../components/ProgressBar';
import { AnimatedButton } from '../components/AnimatedButton';

export const DetailScreen: React.FC = () => {
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation<DetailScreenNavigationProp>();
  const { instrument } = route.params;

  // Consumo estricto del store global con selectores específicos
  const isSaved = useSavedStore((state) =>
    state.savedItems.some((item) => item.id === instrument.id)
  );
  const toggleItem = useSavedStore((state) => state.toggleItem);

  const handleToggleSave = () => {
    toggleItem(instrument);
  };

  // REQUISITO SEMANA 09: Animación de entrada parallel (fade in: 0->1 y slide up: 30->0 con duración 500ms)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Configurar header con título, botón de edición y botón de guardado en la esquina superior derecha
  useLayoutEffect(() => {
    navigation.setOptions({
      title: instrument.name,
      headerBackTitle: 'Catálogo',
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Edit', { id: instrument.id, instrument })}
            activeOpacity={0.7}
            style={styles.headerSaveButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="create-outline" size={22} color={COLORS.primaryLight} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleToggleSave}
            activeOpacity={0.7}
            style={styles.headerSaveButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={isSaved ? COLORS.primaryLight : COLORS.textPrimary}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, instrument, isSaved, handleToggleSave]);

  const getStatusBadgeStyle = (status: Instrument['status']) => {
    switch (status) {
      case 'Disponible':
        return styles.statusBadgeAvailable;
      case 'En préstamo':
        return styles.statusBadgeLoan;
      case 'Asignado':
        return styles.statusBadgeAssigned;
      case 'En mantenimiento':
        return styles.statusBadgeMaintenance;
    }
  };

  const getStatusTextStyle = (status: Instrument['status']) => {
    switch (status) {
      case 'Disponible':
        return styles.statusTextAvailable;
      case 'En préstamo':
        return styles.statusTextLoan;
      case 'Asignado':
        return styles.statusTextAssigned;
      case 'En mantenimiento':
        return styles.statusTextMaintenance;
    }
  };

  const handleActionPress = () => {
    Alert.alert(
      'Solicitud de Instrumento',
      `Has iniciado el proceso de préstamo para "${instrument.name}". Tu solicitud ha sido registrada bajo la supervisión de ${instrument.responsibleTeacher.name}.`,
      [{ text: 'Entendido', style: 'default' }]
    );
  };

  const isAvailable = instrument.status === 'Disponible';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Imagen Principal de Alta Resolución con botón flotante */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: instrument.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlayBadges}>
          <View style={[styles.statusBadgeBase, getStatusBadgeStyle(instrument.status)]}>
            <Text style={[styles.statusTextBase, getStatusTextStyle(instrument.status)]}>
              ● {instrument.status}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleToggleSave}
          activeOpacity={0.8}
          style={[styles.floatingSaveButton, isSaved && styles.floatingSaveButtonActive]}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? COLORS.textInverse : COLORS.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Encabezado del Detalle */}
      <View style={styles.body}>
        <View style={styles.tagsRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{instrument.category}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Nivel {instrument.level}</Text>
          </View>
          <View style={styles.idBadge}>
            <Text style={styles.idBadgeText}>ID: {instrument.id.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.title}>{instrument.name}</Text>

        {/* Botón dinámico interactivo de Guardar / Quitar con Zustand */}
        <TouchableOpacity
          style={[styles.saveToggleCard, isSaved && styles.saveToggleCardActive]}
          onPress={handleToggleSave}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? COLORS.primaryLight : COLORS.textSecondary}
          />
          <View style={styles.saveToggleTextContainer}>
            <Text style={[styles.saveToggleTitle, isSaved && styles.saveToggleTitleActive]}>
              {isSaved ? 'Guardado en tus favoritos' : 'Guardar instrumento'}
            </Text>
            <Text style={styles.saveToggleSubtitle}>
              {isSaved
                ? 'Toca para quitar de tu lista de seguimiento'
                : 'Toca para tenerlo a mano en la pestaña de Guardados'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Valor comercial */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Valor Comercial Estimado:</Text>
          <Text style={styles.priceValue}>
            ${instrument.priceCOP.toLocaleString('es-CO')}{' '}
            <Text style={styles.currency}>COP</Text>
          </Text>
        </View>

        {/* Sección: Descripción Técnica */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Descripción Técnica</Text>
          <Text style={styles.descriptionText}>{instrument.description}</Text>
        </View>

        {/* Sección: Ubicación Física */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ubicación y Almacenamiento</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sede / Espacio:</Text>
            <Text style={styles.infoValue}>{instrument.roomLocation}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Condición de Entrega:</Text>
            <Text style={styles.infoValue}>
              {isAvailable ? 'Listo para entrega inmediata' : 'Bajo custodia actual'}
            </Text>
          </View>
        </View>

        {/* Sección: Cátedra y Docente Responsable */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Docente a Cargo</Text>
          <View style={styles.teacherContainer}>
            <View style={styles.teacherAvatar}>
              <Text style={styles.teacherAvatarText}>
                {instrument.responsibleTeacher.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.teacherDetails}>
              <Text style={styles.teacherName}>
                {instrument.responsibleTeacher.name}
              </Text>
              <Text style={styles.teacherSpecialty}>
                {instrument.responsibleTeacher.specialty}
              </Text>
              <Text style={styles.teacherDepartment}>
                {instrument.responsibleTeacher.department}
              </Text>
            </View>
          </View>
        </View>

        {/* Sección: Asignación Estudiantil */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Asignación Académica</Text>
          {instrument.assignedStudent ? (
            <View style={styles.studentBox}>
              <View style={styles.studentHeader}>
                <Text style={styles.studentName}>
                  {instrument.assignedStudent.name}
                </Text>
                <View style={styles.matriculaBadge}>
                  <Text style={styles.matriculaText}>
                    {instrument.assignedStudent.matricula}
                  </Text>
                </View>
              </View>
              <Text style={styles.studentLevel}>
                Nivel del estudiante: {instrument.assignedStudent.level}
              </Text>
            </View>
          ) : (
            <View style={styles.noStudentBox}>
              <Text style={styles.noStudentText}>
                Este instrumento no tiene estudiantes asignados en este momento.
              </Text>
            </View>
          )}
        </View>

        {/* Sección: Barra de Progreso de Dominio y Repertorio (Semana 09) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Progreso Técnico y Repertorio</Text>
          <ProgressBar
            progress={
              instrument.level === 'Iniciación'
                ? 35
                : instrument.level === 'Intermedio'
                ? 65
                : instrument.level === 'Avanzado'
                ? 88
                : 100
            }
            label="Completitud de Obras Asignadas"
            subtitle="Porcentaje de avance en estudios técnicos y obras sinfónicas evaluadas"
          />
        </View>

        {/* Botón de Acción Principal con AnimatedButton */}
        <AnimatedButton
          title={isAvailable ? 'Solicitar Préstamo / Reserva' : 'Consultar Próxima Disponibilidad'}
          onPress={handleActionPress}
          iconName={isAvailable ? 'musical-notes-outline' : 'calendar-outline'}
          variant={isAvailable ? 'primary' : 'secondary'}
          disabled={!isAvailable}
        />

        {/* Botón de Edición con Zod + React Hook Form */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('Edit', { id: instrument.id, instrument })}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={18} color={COLORS.primaryLight} />
          <Text style={styles.editButtonText}>Editar Ficha Técnica (Zod Form)</Text>
        </TouchableOpacity>

        {/* Botón secundario para volver */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>← Volver al Catálogo</Text>
        </TouchableOpacity>
      </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: SPACING.xxl,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerSaveButton: {
    padding: SPACING.xs,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.surfaceElevated,
    paddingVertical: SPACING.md - 2,
    borderRadius: RADIUS.md,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.primaryLight,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  imageContainer: {
    width: '100%',
    height: 260,
    backgroundColor: COLORS.surfaceElevated,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlayBadges: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
  },
  floatingSaveButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: RADIUS.full,
    padding: SPACING.sm,
    borderWidth: SIZES.borderThin,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  floatingSaveButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  body: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: COLORS.badgeCategoryBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  categoryBadgeText: {
    ...TYPOGRAPHY.badge,
    color: COLORS.badgeCategoryText,
    textTransform: 'uppercase',
  },
  levelBadge: {
    backgroundColor: COLORS.badgeLevelBg,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.badgeLevelBorder,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  levelBadgeText: {
    ...TYPOGRAPHY.badge,
    color: COLORS.badgeLevelText,
  },
  idBadge: {
    backgroundColor: COLORS.surfaceHighlight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  idBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  statusBadgeBase: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  statusBadgeAvailable: {
    backgroundColor: COLORS.availableBg,
  },
  statusBadgeLoan: {
    backgroundColor: COLORS.loanBg,
  },
  statusBadgeAssigned: {
    backgroundColor: COLORS.assignedBg,
  },
  statusBadgeMaintenance: {
    backgroundColor: COLORS.maintenanceBg,
  },
  statusTextBase: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextAvailable: {
    color: COLORS.availableText,
  },
  statusTextLoan: {
    color: COLORS.loanText,
  },
  statusTextAssigned: {
    color: COLORS.assignedText,
  },
  statusTextMaintenance: {
    color: COLORS.maintenanceText,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  saveToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.border,
  },
  saveToggleCardActive: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.surfaceHighlight,
  },
  saveToggleTextContainer: {
    flex: 1,
    gap: 2,
  },
  saveToggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  saveToggleTitleActive: {
    color: COLORS.primaryLight,
  },
  saveToggleSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  priceContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.border,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primaryLight,
  },
  currency: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    borderBottomWidth: SIZES.borderThin,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: SPACING.xs,
  },
  descriptionText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  teacherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingTop: SPACING.xs,
  },
  teacherAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  teacherDetails: {
    flex: 1,
    gap: 2,
  },
  teacherName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  teacherSpecialty: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },
  teacherDepartment: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  studentBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.borderLight,
    gap: SPACING.xs,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.studentHighlight,
  },
  matriculaBadge: {
    backgroundColor: COLORS.surfaceHighlight,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  matriculaText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  studentLevel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  noStudentBox: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.borderLight,
  },
  noStudentText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  actionButtonDisabled: {
    backgroundColor: COLORS.surfaceHighlight,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  backButton: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

// src/screens/CommunityScreen.tsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ListRenderItem,
} from 'react-native';
import { TEACHERS, STUDENTS, INSTRUMENTS } from '../data/mockData';
import { Teacher, Student } from '../types';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SIZES } from '../theme';

type TabView = 'teachers' | 'students';

export const CommunityScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>('teachers');

  // Mapa de conteo de instrumentos bajo custodia de cada profesor
  const teacherInstrumentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    INSTRUMENTS.forEach((inst) => {
      const teacherId = inst.responsibleTeacher.id;
      counts[teacherId] = (counts[teacherId] || 0) + 1;
    });
    return counts;
  }, []);

  // Mapa de instrumento asignado a cada estudiante
  const studentInstrumentMap = useMemo(() => {
    const map: Record<string, string> = {};
    INSTRUMENTS.forEach((inst) => {
      if (inst.assignedStudent) {
        map[inst.assignedStudent.id] = inst.name;
      }
    });
    return map;
  }, []);

  const renderTeacherItem: ListRenderItem<Teacher> = useCallback(
    ({ item }) => {
      const instrumentCount = teacherInstrumentCounts[item.id] || 0;
      return (
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.cardMainInfo}>
              <Text style={styles.personName}>{item.name}</Text>
              <Text style={styles.personRole}>{item.department}</Text>
              <Text style={styles.personSpecialty}>{item.specialty}</Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.footerLabel}>Instrumentos en custodia:</Text>
            <View style={styles.counterBadge}>
              <Text style={styles.counterBadgeText}>
                {instrumentCount} {instrumentCount === 1 ? 'unidad' : 'unidades'}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [teacherInstrumentCounts]
  );

  const renderStudentItem: ListRenderItem<Student> = useCallback(
    ({ item }) => {
      const assignedInstrument = studentInstrumentMap[item.id];
      return (
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <View style={[styles.avatar, styles.studentAvatar]}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.cardMainInfo}>
              <View style={styles.studentTitleRow}>
                <Text style={styles.personName}>{item.name}</Text>
                <View style={styles.matriculaBadge}>
                  <Text style={styles.matriculaText}>{item.matricula}</Text>
                </View>
              </View>
              <Text style={styles.studentLevelText}>Nivel: {item.level}</Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.footerLabel}>Instrumento Asignado:</Text>
            <Text style={styles.assignedInstrumentText} numberOfLines={1}>
              {assignedInstrument || 'Sin instrumento activo'}
            </Text>
          </View>
        </View>
      );
    },
    [studentInstrumentMap]
  );

  const ItemSeparator = useCallback(() => <View style={styles.separator} />, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Selector de Segmento: Profesores vs Estudiantes */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeTab === 'teachers' && styles.segmentButtonActive,
          ]}
          onPress={() => setActiveTab('teachers')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'teachers' && styles.segmentTextActive,
            ]}
          >
            Docentes ({TEACHERS.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeTab === 'students' && styles.segmentButtonActive,
          ]}
          onPress={() => setActiveTab('students')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'students' && styles.segmentTextActive,
            ]}
          >
            Estudiantes ({STUDENTS.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista del segmento activo */}
      {activeTab === 'teachers' ? (
        <FlatList
          data={TEACHERS}
          keyExtractor={(item) => item.id}
          renderItem={renderTeacherItem}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={STUDENTS}
          keyExtractor={(item) => item.id}
          renderItem={renderStudentItem}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  segmentContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.surfaceElevated,
    borderBottomWidth: SIZES.borderThin,
    borderBottomColor: COLORS.borderLight,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.border,
  },
  segmentButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  separator: {
    height: SIZES.separatorHeight,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatar: {
    backgroundColor: COLORS.assignedBg,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textInverse,
  },
  cardMainInfo: {
    flex: 1,
    gap: 2,
  },
  studentTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  personName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  personRole: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },
  personSpecialty: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
    color: COLORS.studentHighlight,
  },
  studentLevelText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xs,
    borderTopWidth: SIZES.borderThin,
    borderTopColor: COLORS.borderLight,
    marginTop: SPACING.xs,
  },
  footerLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  counterBadge: {
    backgroundColor: COLORS.badgeCategoryBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xs,
  },
  counterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.badgeCategoryText,
  },
  assignedInstrumentText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.availableText,
    flexShrink: 1,
    textAlign: 'right',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { Project } from '../types';
import { getProjects } from '../lib/storage';

const BackstageScreen: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<'all' | 'planning' | 'live' | 'complete'>('all');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const data = await getProjects();
    setProjects(data);
  };

  const filteredProjects = projects.filter(p =>
    filter === 'all' ? true : p.status === filter
  );

  const stats = {
    total: projects.length,
    live: projects.filter(p => p.status === 'live').length,
    complete: projects.filter(p => p.status === 'complete').length,
    tasksCompleted: projects.reduce((sum, p) => sum + p.tasksCompleted, 0),
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={gradients.primary} style={styles.header}>
        <Text style={styles.headerTitle}>🎭 THE BACKSTAGE</Text>
        <Text style={styles.headerSubtitle}>Your Project Command Center</Text>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Projects</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.live}</Text>
          <Text style={styles.statLabel}>Live</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.complete}</Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.tasksCompleted}</Text>
          <Text style={styles.statLabel}>Tasks Done</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'planning', 'live', 'complete'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Projects List */}
      <ScrollView style={styles.projectsList}>
        {filteredProjects.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No projects yet</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all'
                ? 'Start planning your first tour!'
                : `No ${filter} projects`}
            </Text>
          </View>
        ) : (
          filteredProjects.map((project) => (
            <View key={project.id} style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <Text style={styles.projectName}>{project.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
                  <Text style={styles.statusText}>{project.status.toUpperCase()}</Text>
                </View>
              </View>

              <Text style={styles.projectDescription} numberOfLines={2}>
                {project.description}
              </Text>

              <View style={styles.projectProgress}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{project.progress}%</Text>
              </View>

              <View style={styles.projectFooter}>
                <Text style={styles.projectMeta}>
                  {project.tasksCompleted}/{project.tasksTotal} tasks
                </Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(project.priority) }]}>
                  <Text style={styles.priorityText}>{project.priority}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planning': return colors.info;
    case 'live': return colors.success;
    case 'complete': return colors.purple;
    default: return colors.textMuted;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return colors.priorityHigh;
    case 'medium': return colors.priorityMedium;
    case 'low': return colors.priorityLow;
    default: return colors.textMuted;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.pink,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: {
    backgroundColor: colors.pink,
    borderColor: colors.pink,
  },
  filterText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.text,
  },
  projectsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  projectCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.background,
  },
  projectDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  projectProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.pink,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.pink,
    width: 40,
    textAlign: 'right',
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.background,
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },
});

export default BackstageScreen;

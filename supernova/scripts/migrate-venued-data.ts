/**
 * VENUED Data Migration Script
 *
 * This script migrates localStorage data from the standalone VENUED app
 * to the PostgreSQL database via SUPERNova API endpoints.
 *
 * Usage:
 * 1. Export localStorage data from VENUED app (browser console):
 *    JSON.stringify(localStorage)
 * 2. Save the output to a file: venued-export.json
 * 3. Run: npx ts-node scripts/migrate-venued-data.ts <userId> venued-export.json
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface LocalStorageProject {
  id: string
  title: string
  description?: string
  emoji?: string
  status?: string
  color?: string
  archived?: boolean
  createdAt?: string
  updatedAt?: string
}

interface LocalStorageTask {
  id: string
  projectId: string
  phaseId?: string
  title: string
  description?: string
  status?: string
  priority?: string
  dueDate?: string
  completedAt?: string
  points?: number
  tags?: string[]
  createdAt?: string
}

interface LocalStoragePhase {
  id: string
  projectId: string
  name: string
  order: number
  color?: string
  startDate?: string
  endDate?: string
}

interface LocalStorageGoal {
  id: string
  projectId: string
  title: string
  description?: string
  targetDate?: string
  completedAt?: string
  progress?: number
}

async function migrateProject(userId: string, project: LocalStorageProject) {
  try {
    const existing = await prisma.venuedProject.findFirst({
      where: { id: project.id, userId },
    })

    if (existing) {
      console.log(`⏭️  Skipping existing project: ${project.title}`)
      return existing
    }

    const created = await prisma.venuedProject.create({
      data: {
        id: project.id,
        userId,
        title: project.title,
        description: project.description,
        emoji: project.emoji || '🎸',
        status: (project.status as any) || 'BACKSTAGE',
        color: project.color || '#FF008E',
        archived: project.archived || false,
        createdAt: project.createdAt ? new Date(project.createdAt) : undefined,
        updatedAt: project.updatedAt ? new Date(project.updatedAt) : undefined,
      },
    })

    console.log(`✅ Migrated project: ${project.title}`)
    return created
  } catch (error) {
    console.error(`❌ Failed to migrate project ${project.title}:`, error)
    throw error
  }
}

async function migratePhase(userId: string, phase: LocalStoragePhase) {
  try {
    const existing = await prisma.venuedPhase.findFirst({
      where: { id: phase.id },
    })

    if (existing) {
      console.log(`⏭️  Skipping existing phase: ${phase.name}`)
      return existing
    }

    const created = await prisma.venuedPhase.create({
      data: {
        id: phase.id,
        projectId: phase.projectId,
        name: phase.name,
        order: phase.order,
        color: phase.color || '#00F0E9',
        startDate: phase.startDate ? new Date(phase.startDate) : undefined,
        endDate: phase.endDate ? new Date(phase.endDate) : undefined,
      },
    })

    console.log(`✅ Migrated phase: ${phase.name}`)
    return created
  } catch (error) {
    console.error(`❌ Failed to migrate phase ${phase.name}:`, error)
    throw error
  }
}

async function migrateTask(userId: string, task: LocalStorageTask) {
  try {
    const existing = await prisma.venuedTask.findFirst({
      where: { id: task.id },
    })

    if (existing) {
      console.log(`⏭️  Skipping existing task: ${task.title}`)
      return existing
    }

    const created = await prisma.venuedTask.create({
      data: {
        id: task.id,
        userId,
        projectId: task.projectId,
        phaseId: task.phaseId,
        title: task.title,
        description: task.description,
        status: (task.status as any) || 'TODO',
        priority: (task.priority as any) || 'MEDIUM',
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        points: task.points || 10,
        tags: task.tags || [],
        createdAt: task.createdAt ? new Date(task.createdAt) : undefined,
      },
    })

    console.log(`✅ Migrated task: ${task.title}`)
    return created
  } catch (error) {
    console.error(`❌ Failed to migrate task ${task.title}:`, error)
    throw error
  }
}

async function migrateGoal(userId: string, goal: LocalStorageGoal) {
  try {
    const existing = await prisma.venuedGoal.findFirst({
      where: { id: goal.id },
    })

    if (existing) {
      console.log(`⏭️  Skipping existing goal: ${goal.title}`)
      return existing
    }

    const created = await prisma.venuedGoal.create({
      data: {
        id: goal.id,
        userId,
        projectId: goal.projectId,
        title: goal.title,
        description: goal.description,
        targetDate: goal.targetDate ? new Date(goal.targetDate) : undefined,
        completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined,
        progress: goal.progress || 0,
      },
    })

    console.log(`✅ Migrated goal: ${goal.title}`)
    return created
  } catch (error) {
    console.error(`❌ Failed to migrate goal ${goal.title}:`, error)
    throw error
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.error('Usage: npx ts-node scripts/migrate-venued-data.ts <userId> <exportFile>')
    console.error('Example: npx ts-node scripts/migrate-venued-data.ts user_123 venued-export.json')
    process.exit(1)
  }

  const [userId, exportFile] = args

  // Verify user exists
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    console.error(`❌ User not found: ${userId}`)
    process.exit(1)
  }

  console.log(`\n🎸 VENUED Data Migration`)
  console.log(`User: ${user.name || user.email} (${userId})`)
  console.log(`Export file: ${exportFile}\n`)

  // Read export file
  const exportPath = path.resolve(process.cwd(), exportFile)
  if (!fs.existsSync(exportPath)) {
    console.error(`❌ Export file not found: ${exportPath}`)
    process.exit(1)
  }

  const rawData = fs.readFileSync(exportPath, 'utf-8')
  const localStorage = JSON.parse(rawData)

  // Parse localStorage keys
  const projects: LocalStorageProject[] = []
  const phases: LocalStoragePhase[] = []
  const tasks: LocalStorageTask[] = []
  const goals: LocalStorageGoal[] = []

  for (const [key, value] of Object.entries(localStorage)) {
    try {
      if (key.startsWith('venued_project_')) {
        projects.push(JSON.parse(value as string))
      } else if (key.startsWith('venued_phase_')) {
        phases.push(JSON.parse(value as string))
      } else if (key.startsWith('venued_task_')) {
        tasks.push(JSON.parse(value as string))
      } else if (key.startsWith('venued_goal_')) {
        goals.push(JSON.parse(value as string))
      }
    } catch (error) {
      console.warn(`⚠️  Failed to parse ${key}:`, error)
    }
  }

  console.log(`Found:`)
  console.log(`  - ${projects.length} projects`)
  console.log(`  - ${phases.length} phases`)
  console.log(`  - ${tasks.length} tasks`)
  console.log(`  - ${goals.length} goals\n`)

  // Migrate in order: projects -> phases -> tasks -> goals
  console.log('📦 Migrating projects...')
  for (const project of projects) {
    await migrateProject(userId, project)
  }

  console.log('\n📋 Migrating phases...')
  for (const phase of phases) {
    await migratePhase(userId, phase)
  }

  console.log('\n✅ Migrating tasks...')
  for (const task of tasks) {
    await migrateTask(userId, task)
  }

  console.log('\n🎯 Migrating goals...')
  for (const goal of goals) {
    await migrateGoal(userId, goal)
  }

  console.log('\n🎉 Migration complete!')
  console.log(`\nRun this query to verify:`)
  console.log(`SELECT COUNT(*) FROM "VenuedProject" WHERE "userId" = '${userId}';`)
}

main()
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

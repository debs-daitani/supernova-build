const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function enablePgVector() {
  try {
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;')
    console.log('✅ pgvector extension enabled successfully!')
  } catch (error) {
    console.error('Error enabling pgvector:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

enablePgVector()

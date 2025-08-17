import 'dotenv/config'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient | undefined

function generateUniqueDatabaseUrl(schemaId: string) {
  const base = process.env.DATABASE_URL
  if (!base) {
    throw new Error('Please provide a DATABASE_URL environment variable')
  }
  const url = new URL(base)
  url.searchParams.set('schema', schemaId)
  return url.toString()
}

const schemaId = `test_${randomUUID().replace(/-/g, '')}`

beforeAll(async () => {
  // Ensure generated client exists before importing
  if (!existsSync('node_modules/.prisma/client')) {
    execSync('pnpm prisma generate', { stdio: 'inherit' })
  }
  const databaseUrl = generateUniqueDatabaseUrl(schemaId)
  process.env.DATABASE_URL = databaseUrl

  prisma = new PrismaClient()

  // Use db push (idempotent) to apply schema without migration conflicts
  execSync('pnpm prisma db push', { stdio: 'inherit' })

  console.log(`E2E DB ready at schema ${schemaId}`)
})

afterAll(async () => {
  if (prisma) {
    await prisma.$executeRawUnsafe(
      `DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`,
    )
    await prisma.$disconnect()
  }
})

export { prisma }

import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  errorFormat: 'pretty',
})

// Enhanced error logging
prisma.$use(async (params, next) => {
  const before = Date.now()
  try {
    const result = await next(params)
    const after = Date.now()
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Prisma] ${params.model}.${params.action} took ${after - before}ms`)
    }
    return result
  } catch (error) {
    const after = Date.now()
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(`[Prisma Error] ${params.model}.${params.action} failed after ${after - before}ms`)
      console.error(`Code: ${error.code}`)
      console.error(`Meta:`, error.meta)
      console.error(`Message:`, error.message)
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      console.error(`[Prisma Validation Error] ${params.model}.${params.action} failed after ${after - before}ms`)
      console.error(`Message:`, error.message)
    } else {
      console.error(`[Prisma Unknown Error] ${params.model}.${params.action} failed after ${after - before}ms`)
      console.error(error)
    }
    throw error
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['error', 'warn'] // 'query' log'unu kaldırdık - çok fazla log üretiyor ve connection sorunlarına yol açıyor
    : ['error'],
  errorFormat: 'pretty',
})

// Enhanced error logging - sadece hata durumlarında log
prisma.$use(async (params, next) => {
  try {
    const result = await next(params)
    return result
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(`[Prisma Error] ${params.model}.${params.action} failed`)
      console.error(`Code: ${error.code}`)
      console.error(`Meta:`, error.meta)
      console.error(`Message:`, error.message)
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      console.error(`[Prisma Validation Error] ${params.model}.${params.action} failed`)
      console.error(`Message:`, error.message)
    } else {
      console.error(`[Prisma Unknown Error] ${params.model}.${params.action} failed`)
      console.error(error)
    }
    throw error
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

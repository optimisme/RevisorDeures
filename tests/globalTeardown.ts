import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function globalTeardown() {
  try {
    await prisma.resultatCriteri.deleteMany();
    await prisma.entrega.deleteMany();
    await prisma.criteri.deleteMany();
    await prisma.practica.deleteMany();
  } finally {
    await prisma.$disconnect();
  }
  
  if ((global as any).__TEST_SERVER__) {
    await new Promise<void>((resolve) => {
      (global as any).__TEST_SERVER__.close(() => resolve());
    });
  }
}

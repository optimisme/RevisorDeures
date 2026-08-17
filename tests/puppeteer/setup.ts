import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import app from '../../src/index';

const execAsync = promisify(exec);

const prisma = new PrismaClient();

let server: any;

beforeAll(async () => {
  await prisma.$connect();
  await seedTestData();

  server = app.listen(3001, () => {
    console.log('Test server running on port 3001');
  });
});

afterAll(async () => {
  await cleanupTestData();
  await prisma.$disconnect();
  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  }
});

async function seedTestData() {
  await prisma.resultatCriteri.deleteMany();
  await prisma.entrega.deleteMany();
  await prisma.criteri.deleteMany();
  await prisma.practica.deleteMany();

  const practica = await prisma.practica.create({
    data: {
      nom: 'Pràctica de Test',
      descripcio: 'Pràctica per validar tests Puppeteer',
    },
  });

  await prisma.criteri.createMany({
    data: [
      {
        text: 'El repositori té un README.md',
        posicio: 1,
        practicaId: practica.id,
      },
      {
        text: 'El codi compila sense errors',
        posicio: 2,
        practicaId: practica.id,
      },
      {
        text: 'Les proves pasen correctament',
        posicio: 3,
        practicaId: practica.id,
      },
    ],
  });

  const entrega = await prisma.entrega.create({
    data: {
      urlRepo: 'https://github.com/testuser/test-repo',
      practicaId: practica.id,
      estat: 'COMPLETED',
    },
  });

  await prisma.resultatCriteri.createMany({
    data: [
      {
        status: 'PASS',
        evidencia: 'README.md trobat al directori arrel',
        feedback: 'El fitxer README.md existeix i conté informació vàlida',
        entregaId: entrega.id,
        criteriId: (await prisma.criteri.findFirstOrThrow({ where: { posicio: 1, practicaId: practica.id } })).id,
      },
      {
        status: 'FAIL',
        evidencia: 'Errors de compilació trobats',
        feedback: 'El codi no compila correctament, cal revisar els errors',
        entregaId: entrega.id,
        criteriId: (await prisma.criteri.findFirstOrThrow({ where: { posicio: 2, practicaId: practica.id } })).id,
      },
      {
        status: 'NEEDS_REVIEW',
        evidencia: 'Proves pendents de revisió manual',
        feedback: 'Algunes proves necessiten validació manual',
        entregaId: entrega.id,
        criteriId: (await prisma.criteri.findFirstOrThrow({ where: { posicio: 3, practicaId: practica.id } })).id,
      },
    ],
  });
}

async function cleanupTestData() {
  await prisma.resultatCriteri.deleteMany();
  await prisma.entrega.deleteMany();
  await prisma.criteri.deleteMany();
  await prisma.practica.deleteMany();
}

export { prisma, server };

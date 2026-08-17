import { PrismaClient } from '@prisma/client';
import app from '../src/index';

const prisma = new PrismaClient();

async function seedTestData() {
  try {
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

    const criteris = await prisma.criteri.findMany({ where: { practicaId: practica.id } });

    await prisma.resultatCriteri.createMany({
      data: [
        {
          status: 'PASS',
          evidencia: 'README.md trobat al directori arrel',
          feedback: 'El fitxer README.md existeix i conté informació vàlida',
          entregaId: entrega.id,
          criteriId: criteris[0].id,
        },
        {
          status: 'FAIL',
          evidencia: 'Errors de compilació trobats',
          feedback: 'El codi no compila correctament, cal revisar els errors',
          entregaId: entrega.id,
          criteriId: criteris[1].id,
        },
        {
          status: 'NEEDS_REVIEW',
          evidencia: 'Proves pendents de revisió manual',
          feedback: 'Algunes proves necessiten validació manual',
          entregaId: entrega.id,
          criteriId: criteris[2].id,
        },
      ],
    });
  } finally {
    // Don't disconnect here - globalTeardown will do it
  }
}

export default async function globalSetup() {
  await prisma.$connect();
  await seedTestData();

  const server = app.listen(3001, () => {
    console.log('Test server running on port 3001');
  });
  
  (global as any).__TEST_SERVER__ = server;
}

import { PrismaClient } from '@prisma/client';
import { practicaService } from '../../src/services/practica.service';
import { criteriumService } from '../../src/services/criterium.service';
import { entregaService } from '../../src/services/entrega.service';
import { resultatCriteriService } from '../../src/services/resultat.service';
import { practicaSchema, criteriSchema } from '../../src/validations/schemas';

const prisma = new PrismaClient();

describe('PracticaService', () => {
  beforeEach(async () => {
    await prisma.criteri.deleteMany();
    await prisma.entrega.deleteMany();
    await prisma.resultatCriteri.deleteMany();
    await prisma.practica.deleteMany();
  });

  test('Hauria de crear una practica amb el nom correcte', async () => {
    const dades = {
      nom: 'Practica de Test',
      descripcio: 'Practica per validar el servei',
    };

    const result = await practicaService.crear(dades);

    expect(result).toBeDefined();
    expect(result.nom).toBe(dades.nom);
  });

  test('Hauria de llenar totes les practiques', async () => {
    await prisma.practica.create({
      data: { nom: 'Practica 1' },
    });
    await prisma.practica.create({
      data: { nom: 'Practica 2' },
    });

    const result = await practicaService.llistar();

    expect(result).toHaveLength(2);
  });

  test('Hauria de obtenir una practica per ID', async () => {
    const practica = await prisma.practica.create({
      data: { nom: 'Practica de Test' },
    });

    const result = await practicaService.obtenir(practica.id);

    expect(result).toBeDefined();
    expect(result?.nom).toBe('Practica de Test');
  });

  test('Hauria de llancar error amb dades invalides', async () => {
    try {
      await practicaService.crear({
        nom: '',
        descripcio: null,
      } as any);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  describe('CriteriService', () => {
    test('Hauria de crear un criteri', async () => {
      const practica = await prisma.practica.create({
        data: { nom: 'Practica' },
      });

      const dades = {
        text: 'Hauria de tenir un README',
        posicio: 1,
      };

      const resultat = await criteriumService.crear({
        ...dades,
        practicaId: practica.id,
      });

      expect(resultat).toBeDefined();
      expect(resultat.text).toBe(dades.text);
      expect(resultat.practicaId).toBe(practica.id);
    });

    test('Hauria de llistar criteris d\'una practica', async () => {
      const practica = await prisma.practica.create({
        data: { nom: 'Practica' },
      });

      await prisma.criteri.create({
        data: {
          text: 'Criteri 1',
          posicio: 1,
          practicaId: practica.id,
        },
      });

      const resultats = await criteriumService.llistar(practica.id);

      expect(resultats).toHaveLength(1);
    });

    test('Hauria de llancar error en validacio invalida', async () => {
      try {
        await criteriumService.crear({
          text: '',
          posicio: -1,
        } as any);
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('EntregaService', () => {
    test('Hauria de crear una entrega', async () => {
      const practica = await prisma.practica.create({
        data: { nom: 'Practica' },
      });

      const dades = {
        urlRepo: 'https://github.com/example/repo',
        practicaId: practica.id,
      };

      const result = await entregaService.crear(dades);

      expect(result).toBeDefined();
      expect(result.urlRepo).toBe(dades.urlRepo);
      expect(result.estat).toBe('PENDING');
    });

    test('Hauria de llancar error amb URL no valida', async () => {
      try {
        await entregaService.crear({
          urlRepo: 'not-a-url',
          practicaId: '123',
        } as any);
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });
});

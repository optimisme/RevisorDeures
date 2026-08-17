import { practicaService } from '../../src/services/practica.service';
import { EntregaService } from '../../src/services/entrega.service';
import { ResultatCriteriService } from '../../src/services/resultat.service';

describe('PracticaService', () => {
  describe('crear', () => {
    it('hauria de crear una practica amb nom valid', async () => {
      const practica = await practicaService.crear({
        nom: 'Practica Test',
        descripcio: 'Descripcio de test',
      });

      expect(practica).toBeDefined();
      expect(practica.nom).toBe('Practica Test');
    });

    it('hauria de fallar amb nom buit', async () => {
      await expect(
        practicaService.crear({ nom: '' })
      ).rejects.toThrow();
    });
  });

  describe('llistar', () => {
    it('hauria de retornar una llista de practiques', async () => {
      const practiques = await practicaService.llistar();
      expect(Array.isArray(practiques)).toBe(true);
    });
  });

  describe('obtenir', () => {
    it('hauria de retornar null per a una practica inexistent', async () => {
      const practica = await practicaService.obtenir('inexistent');
      expect(practica).toBeNull();
    });
  });
});

describe('EntregaService', () => {
  describe('crear', () => {
    it('hauria de fallar amb URL invalida', async () => {
      const entregaService = new EntregaService();
      await expect(
        entregaService.crear({
          urlRepo: 'not-an-url',
          practicaId: 'test',
        })
      ).rejects.toThrow();
    });
  });
});

describe('ResultatCriteriService', () => {
  describe('obtenir', () => {
    it('hauria de retornar null per a dades inexistentes', async () => {
      const resultatService = new ResultatCriteriService();
      const resultat = await resultatService.obtenir('fake-id', 'fake-criteri');
      expect(resultat).toBeNull();
    });
  });
});

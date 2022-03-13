import got from 'got';
import {jest} from '@jest/globals';

const httpClient = got.extend({
  prefixUrl: process.env.API_URL
});

jest.setTimeout(10000);

describe('/types', () => {

  it('recieves all pokemon types', async () => {
    const types = await httpClient.get(`types`).json();

    expect(types.results.length).toBe(18);
    expect(types.results[0].name).not.toBeNull();
  });

  it('has the associated pokemon in ascending order', async () => {
    const types = await httpClient.get(`types`).json();

    types.results.forEach(type => {
      const isAscending = type.pokemon.every((pkmn, index, array) => {
        return index === 0 || pkmn.id >= array[index - 1].id;
      })

      expect(isAscending).toBe(true);
    });
  });

  it('has its type matchups in ascending order', async () => {
    const types = await httpClient.get(`types`).json();

    types.results.forEach(type => {
      const isAscending = type.matchups.every((matchup, index, array) => {
        return index === 0 || matchup.id >= array[index - 1].id;
      })

      expect(isAscending).toBe(true);
    });
  });

  describe('name', () => {
    it('can filter types by name', async () => {
      const types = await httpClient.get(`types?name=fire`).json();
      expect(types.results.length).toBe(1);

      const fire = types.results[0];
    
      expect(fire.id).toBe(7);
      expect(fire.name).toBe('fire');
      expect(fire.damageClass).toBe('special');
      expect(fire.matchups).not.toBeNull();
    });

    it('recieves empty result for unknown name', async () => {
      const types = await httpClient.get(`types?name=unknownName`).json();
      expect(types.results.length).toBe(0);
    });

    it('recieves empty result for purely numerical value', async () => {
      expect.assertions(1);
      try {
        await httpClient.get(`types?name=3`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  });

  describe('ids', () => {
    it('can filter pokemon by multiple ids', async () => {
      const types = await httpClient.get(`types?ids=1,2,3`).json();
      expect(types.results.length).toBe(3);

      const bug = types.results[0];
      const dark = types.results[1];
      const dragon = types.results[2];
    
      expect(bug.id).toBe(1);
      expect(bug.name).toBe('bug');
      expect(bug.damageClass).toBe('physical');
      expect(bug.matchups).not.toBeNull();
    
      expect(dark.id).toBe(2);
      expect(dark.name).toBe('dark');
      expect(dark.damageClass).toBe('special');
      expect(dark.matchups).not.toBeNull();
    
      expect(dragon.id).toBe(3);
      expect(dragon.name).toBe('dragon');
      expect(dragon.damageClass).toBe('special');
      expect(dragon.matchups).not.toBeNull();
    });

    it('can filter pokemon by a single id', async () => {
      const types = await httpClient.get(`types?ids=1`).json();
      expect(types.results.length).toBe(1);

      const bug = types.results[0];
    
      expect(bug.id).toBe(1);
      expect(bug.name).toBe('bug');
      expect(bug.damageClass).toBe('physical');
      expect(bug.matchups).not.toBeNull();
    });
  });

  describe('limit', () => {
    it('recieves the expected amout of elements based on limit parameter', async () => {
      const types = await httpClient.get(`types?limit=10`).json();
  
      expect(types.results.length).toBe(10);
    });
  });

  describe('start', () => {
    it('recieves expected subset with start and limit', async () => {
      const fullRange = await httpClient.get(`types?start=0&limit=10`).json();
      const subSet = await httpClient.get(`types?start=5&limit=5`).json();

      expect(fullRange.results).toEqual(expect.arrayContaining(subSet.results));
    });

    it('recieves nothing if start exceeds total', async () => {
      const types = await httpClient.get(`types?start=1000`).json();
  
      expect(types.results.length).toBe(0);
    });
  });

  describe("single", () => {
    it('recieves bug for /1', async () => {
      const bug = await httpClient.get(`types/1`).json();

      expect(bug.id).toBe(1);
      expect(bug.name).toBe('bug');
      expect(bug.damageClass).toBe('physical');
      expect(bug.matchups).not.toBeNull();
    });
  
    it('recieves 404 for a non numeric id', async () => {
      try {
        await httpClient.get(`types/abc`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  
    it('recieves 404 for a non integer id', async () => {
      try {
        await httpClient.get(`types/1.5`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  
    it('recieves 404 for a negative id', async () => {
      try {
        await httpClient.get(`types/-1`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  
    it('recieves 404 for an id which exceeds the total amount', async () => {
      try {
        await httpClient.get(`types/1000`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(404);
      }
    });
  })
});
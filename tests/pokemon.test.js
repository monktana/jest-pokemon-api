import got from 'got';
import { API_URL } from '../settings';


const httpClient = got.extend({
  prefixUrl: API_URL
});

describe('pokemon', () => {

  it('recieves multiple pokemon', async () => {
    const pokemon = await httpClient.get(`pokemon?limit=10&start=0`).json();

    expect(pokemon.results.length).toBe(10);
    expect(pokemon.results[0].name).not.toBeNull();
  });

  describe('name', () => {
    it('can filter pokemon by name', async () => {
      const pokemon = await httpClient.get(`pokemon?name=bulbasaur`).json();
      expect(pokemon.results.length).toBe(1);

      const bulbasaur = pokemon.results[0];
    
      expect(bulbasaur.id).toBe(1);
      expect(bulbasaur.name).toBe('bulbasaur');
      expect(bulbasaur.types).not.toBeNull();
      expect(bulbasaur.types.find(type => type.name == 'grass')).not.toBeNull();
    });

    it('recieves empty result for unknown name', async () => {
      const pokemon = await httpClient.get(`pokemon?name=unknownName`).json();
      expect(pokemon.results.length).toBe(0);
    });

    it('recieves empty result for purely numerical value', async () => {
      const pokemon = await httpClient.get(`pokemon?name=3`).json();
      expect(pokemon.results.length).toBe(0);
    });
  });

  describe('ids', () => {
    it('can filter pokemon by multiple ids', async () => {
      const pokemon = await httpClient.get(`pokemon?ids=1,2,3`).json();
      expect(pokemon.results.length).toBe(3);

      const bulbasaur = pokemon.results[0];
      const ivysaur = pokemon.results[1];
      const venusaur = pokemon.results[2];
    
      expect(bulbasaur.id).toBe(1);
      expect(bulbasaur.name).toBe('bulbasaur');
      expect(bulbasaur.types).not.toBeNull();
      expect(bulbasaur.types.find(type => type.name == 'grass')).not.toBeNull();
    
      expect(ivysaur.id).toBe(2);
      expect(ivysaur.name).toBe('ivysaur');
      expect(ivysaur.types).not.toBeNull();
      expect(ivysaur.types.find(type => type.name == 'grass')).not.toBeNull();
      expect(ivysaur.types.find(type => type.name == 'poison')).not.toBeNull();
    
      expect(venusaur.id).toBe(3);
      expect(venusaur.name).toBe('venusaur');
      expect(venusaur.types).not.toBeNull();
      expect(venusaur.types.find(type => type.name == 'grass')).not.toBeNull();
      expect(venusaur.types.find(type => type.name == 'poison')).not.toBeNull();
    });

    it('can filter pokemon by a single id', async () => {
      const pokemon = await httpClient.get(`pokemon?ids=1`).json();
      expect(pokemon.results.length).toBe(1);

      const bulbasaur = pokemon.results[0];
    
      expect(bulbasaur.id).toBe(1);
      expect(bulbasaur.name).toBe('bulbasaur');
      expect(bulbasaur.types).not.toBeNull();
      expect(bulbasaur.types.find(type => type.name == 'grass')).not.toBeNull();
    });

    it('recieves an error if ids is used multiple times in querystring', async () => {
      expect.assertions(1);

      try {
        await httpClient.get(`pokemon?ids=1&ids=2`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });

    it('recieves an error if ids are sent as an object', async () => {
      expect.assertions(1);

      try {
        await httpClient.get(`pokemon?ids[]=1`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });

    it('recieves an error if ids is not in the expected format', async () => {
      expect.assertions(2);

      try {
        await httpClient.get(`pokemon?ids=1;2`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }

      try {
        await httpClient.get(`pokemon?ids=[1,2]`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  });

  describe('limit', () => {

    it('recieves the expected amout of elements based on limit parameter', async () => {
      const pokemon = await httpClient.get(`pokemon?limit=50&start=0`).json();
  
      expect(pokemon.results.length).toBe(50);
    });

    it(`recieves error for invalid limit parameter`, async () => {
      expect.assertions(1);

      try {
        await httpClient.get(`pokemon?limit=a&start=0`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  
    it(`recieves error for negative limit`, async () => {
      expect.assertions(1);

      try {
        await httpClient.get(`pokemon?limit=-1&start=0`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  });

  describe('start', () => {

    it('recieves expected subset with start and limit', async () => {
      const fullRange = await httpClient.get(`pokemon?start=0&limit=10`).json();
      const subSet = await httpClient.get(`pokemon?start=6&limit=5`).json();

      expect(fullRange.results).toEqual(expect.arrayContaining(subSet.results));
    });

    it('recieves nothing if start exceeds total', async () => {
      const pokemon = await httpClient.get(`pokemon?start=1000&limit=10`).json();
  
      expect(pokemon.results.length).toBe(0);
    });

    it(`recieves error for invalid start parameter`, async () => {
      expect.assertions(1);

      try {
        await httpClient.get(`pokemon?start=a&limit=10`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  
    it(`recieves error for negative start`, async () => {
      expect.assertions(1);

      try {
        await httpClient.get(`pokemon?start=-1&limit=10`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  });

  describe("single", () => {
    it('recieves bulbasaur for id 1', async () => {
      const bulbasaur = await httpClient.get(`pokemon/1`).json();
  
      expect(bulbasaur.id).toBe(1);
      expect(bulbasaur.name).toBe('bulbasaur');
      expect(bulbasaur.types).not.toBeNull();
      expect(bulbasaur.types.find(type => type.name == 'grass')).not.toBeNull();
    });
  
    it('recieves 404 for a non numeric id', async () => {
      try {
        await httpClient.get(`pokemon/abc`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(404);
      }
    });
  
    it('recieves 404 for a non integer id', async () => {
      try {
        await httpClient.get(`pokemon/1.5`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(404);
      }
    });
  
    it('recieves 404 for a negative id', async () => {
      try {
        await httpClient.get(`pokemon/-1`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(404);
      }
    });
  
    it('recieves 404 for an id which exceeds the total amount', async () => {
      try {
        await httpClient.get(`pokemon/1000`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(404);
      }
    });
  })
});
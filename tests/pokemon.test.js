import got from 'got';
import { API_URL } from '../settings';


const httpClient = got.extend({
  prefixUrl: API_URL
});

describe('pokemon', () => {

  it('recieves multiple pokemon', async () => {
    const pokemon = await httpClient.get(`pokemon?limit=10&offset=0`).json();

    expect(pokemon.total).toBe(898);
    expect(pokemon.results.length).toBe(10);
    
    expect(pokemon.results[0].name).not.toBeNull();
    expect(pokemon.results[0].url).not.toBeNull();
  });

  describe('limit', () => {

    it('recieves the expected amout of elements based on limit parameter', async () => {
      const pokemon = await httpClient.get(`pokemon?limit=50&offset=0`).json();
  
      expect(pokemon.results.length).toBe(50);
    });

    it(`recieves error for invalid limit parameter`, async () => {
      expect.assertions(1);

      try {
        await httpClient.get(`pokemon?limit=a&offset=0`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  
    it(`recieves error for negative limit`, async () => {
      expect.assertions(1);

      try {
        await httpClient.get(`pokemon?limit=-1&offset=0`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  });

  describe('offset', () => {

    it('recieves expected subset with offset and limit', async () => {
      const fullRange = await httpClient.get(`pokemon?offset=0&limit=10`).json();
      const subSet = await httpClient.get(`pokemon?offset=6&limit=5`).json();

      expect(fullRange.results).toEqual(expect.arrayContaining(subSet.results));
    });

    it('recieves nothing if offset exceeds total', async () => {
      const pokemon = await httpClient.get(`pokemon?offset=1000&limit=10`).json();
  
      expect(pokemon.results.length).toBe(0);
    });

    it(`recieves error for invalid offset parameter`, async () => {
      expect.assertions(1);

      try {
        await httpClient.get(`pokemon?offset=a&limit=10`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  
    it(`recieves error for negative offset`, async () => {
      expect.assertions(1);

      try {
        await httpClient.get(`pokemon?offset=-1&limit=10`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  });

  describe("single", () => {
    it('recieves bulbasaur for /1', async () => {
      const bulbasaur = await httpClient.get(`pokemon/1`).json();
  
      expect(bulbasaur.id).toBe(1);
      expect(bulbasaur.name).toBe('bulbasaur');
      expect(bulbasaur.types).not.toBeNull();
      expect(bulbasaur.types.find(type => type.name == 'grass')).not.toBeNull();
    });
  
    it('recieves bulbasaur for /bulbasaur', async () => {
      const bulbasaur = await httpClient.get(`pokemon/bulbasaur`).json();
  
      expect(bulbasaur.id).toBe(1);
      expect(bulbasaur.name).toBe('bulbasaur');
      expect(bulbasaur.types).not.toBeNull();
      expect(bulbasaur.types.find(type => type.name == 'grass')).not.toBeNull();
    });
  
    it('recieves 404 for /abc', async () => {
      try {
        await httpClient.get(`pokemon/abc`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(404);
      }
    });
  
    it('recieves 404 for /1000', async () => {
      try {
        await httpClient.get(`pokemon/1000`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(404);
      }
    });
  })
});
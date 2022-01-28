import got from 'got';
import { API_URL } from '../settings';

describe('/pokemon', () => {

  it('recieves multiple pokemon', async () => {
    const pokemon = await got.get(`${API_URL}/pokemon`).json();

    expect(pokemon.total).toBe(898);
    expect(pokemon.results.length).toBe(20);
    
    expect(pokemon.results[0].name).not.toBeNull();
    expect(pokemon.results[0].url).not.toBeNull();
  });

  describe('limit', () => {

    it('recieves the expected amout of elements based on limit parameter', async () => {
      const pokemon = await got.get(`${API_URL}/pokemon?limit=50`).json();
  
      expect(pokemon.results.length).toBe(50);
    });

    it(`recieves error for invalid limit parameter`, async () => {
      expect.assertions(1);

      try {
        await got.get(`${API_URL}/pokemon?limit=a`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  
    it(`recieves error for negative limit`, async () => {
      expect.assertions(1);

      try {
        await got.get(`${API_URL}/pokemon?limit=-1`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  });

  describe('offset', () => {

    it('recieves expected subset with offset and limit', async () => {
      const fullRange = await got.get(`${API_URL}/pokemon?limit=10`).json();
      const subSet = await got.get(`${API_URL}/pokemon?offset=6&limit=5`).json();

      expect(fullRange.results).toEqual(expect.arrayContaining(subSet.results));
    });

    it('recieves nothing if offset exceeds total', async () => {
      const pokemon = await got.get(`${API_URL}/pokemon?offset=1000`).json();
  
      expect(pokemon.results.length).toBe(0);
    });

    it(`recieves error for invalid offset parameter`, async () => {
      expect.assertions(1);

      try {
        await got.get(`${API_URL}/pokemon?offset=a`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  
    it(`recieves error for negative offset`, async () => {
      expect.assertions(1);

      try {
        await got.get(`${API_URL}/pokemon?offset=-1`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  });

  describe("single", () => {
    it('recieves bulbasaur for /1', async () => {
      const bulbasaur = await got.get(`${API_URL}/pokemon/1`).json();
  
      expect(bulbasaur.id).toBe(1);
      expect(bulbasaur.name).toBe('bulbasaur');
      expect(bulbasaur.types).not.toBeNull();
      expect(bulbasaur.types.find(type => type.name == 'grass')).not.toBeNull();
    });
  
    it('recieves bulbasaur for /bulbasaur', async () => {
      const bulbasaur = await got.get(`${API_URL}/pokemon/bulbasaur`).json();
  
      expect(bulbasaur.id).toBe(1);
      expect(bulbasaur.name).toBe('bulbasaur');
      expect(bulbasaur.types).not.toBeNull();
      expect(bulbasaur.types.find(type => type.name == 'grass')).not.toBeNull();
    });
  
    it('recieves 404 for /abc', async () => {
      try {
        await got.get(`${API_URL}/pokemon/abc`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(404);
      }
    });
  
    it('recieves 404 for /1000', async () => {
      try {
        await got.get(`${API_URL}/pokemon/1000`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(404);
      }
    });
  })
});
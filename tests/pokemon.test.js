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
      expect(bulbasaur.types.grass).toBeTruthy();
    });

    it('can filter for names with a - ', async () => {
      const pokemon = await httpClient.get(`pokemon?name=mr-mime`).json();
      expect(pokemon.results.length).toBe(1);
    });

    it('recieves empty result for unknown name', async () => {
      const pokemon = await httpClient.get(`pokemon?name=unknownName`).json();
      expect(pokemon.results.length).toBe(0);
    });

    it('recieves an error for purely numerical value', async () => {
      expect.assertions(1);
      try {
        await httpClient.get(`pokemon?name=3`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
    
    it('recieves an error for multiple names', async () => {
      expect.assertions(3);

      try {
        await httpClient.get(`pokemon?name=bulbasaur,ivysaur`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }

      try {
        await httpClient.get(`pokemon?name=bulbasaur&name=ivysaur`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }

      try {
        await httpClient.get(`pokemon?name[]=bulbasaur`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  });

  describe('ids', () => {
    it('can filter pokemon by multiple ids', async () => {
      const pokemon = await httpClient.get(`pokemon?ids=1,4,7`).json();
      expect(pokemon.results.length).toBe(3);

      const bulbasaur = pokemon.results[0];
      const charmander = pokemon.results[1];
      const squirtle = pokemon.results[2];
    
      expect(bulbasaur.id).toBe(1);
      expect(bulbasaur.name).toBe('bulbasaur');
      expect(bulbasaur.types).not.toBeNull();
      expect(bulbasaur.types.grass).toBeTruthy();
      expect(bulbasaur.types.poison).toBeTruthy();
    
      expect(charmander.id).toBe(4);
      expect(charmander.name).toBe('charmander');
      expect(charmander.types).not.toBeNull();
      expect(charmander.types.fire).toBeTruthy();
    
      expect(squirtle.id).toBe(7);
      expect(squirtle.name).toBe('squirtle');
      expect(squirtle.types).not.toBeNull();
      expect(squirtle.types.water).toBeTruthy();
    });

    it('can filter pokemon by a single id', async () => {
      const pokemon = await httpClient.get(`pokemon?ids=1`).json();
      expect(pokemon.results.length).toBe(1);

      const bulbasaur = pokemon.results[0];
    
      expect(bulbasaur.id).toBe(1);
      expect(bulbasaur.name).toBe('bulbasaur');
      expect(bulbasaur.types).not.toBeNull();
      expect(bulbasaur.types.grass).toBeTruthy();
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
      expect.assertions(3);

      try {
        await httpClient.get(`pokemon?ids=1;2`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }

      try {
        await httpClient.get(`pokemon?ids=1,2,a`).json();
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
      const pokemon = await httpClient.get(`pokemon?limit=50`).json();
  
      expect(pokemon.results.length).toBe(50);
    });

    it(`recieves error for invalid limit parameter`, async () => {
      expect.assertions(1);

      try {
        await httpClient.get(`pokemon?limit=a`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  
    it(`recieves error for negative limit`, async () => {
      expect.assertions(1);

      try {
        await httpClient.get(`pokemon?limit=-1`).json();
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
      const pokemon = await httpClient.get(`pokemon?start=1000`).json();
  
      expect(pokemon.results.length).toBe(0);
    });

    it(`recieves error for invalid start parameter`, async () => {
      expect.assertions(1);

      try {
        await httpClient.get(`pokemon?start=a`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  
    it(`recieves error for negative start`, async () => {
      expect.assertions(1);

      try {
        await httpClient.get(`pokemon?start=-1`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }
    });
  });

  describe('types', () => {

    it('can filter pokemon by type', async () => {
      const pokemon = await httpClient.get(`pokemon?types=fire`).json();
      expect(pokemon.results.length).toBe(71);
      expect(pokemon.results.find(pokemon => pokemon.name == 'charmander')).not.toBeNull();
    });

    it('finds multitype pokemon', async () => {
      const pokemon = await httpClient.get(`pokemon?types=fire`).json();
      expect(pokemon.results.find(pokemon => pokemon.name == 'charizard')).not.toBeNull();
    });

    it('can filter pokemon by multiple types', async () => {
      const pokemon = await httpClient.get(`pokemon?types=fire,flying`).json();
      expect(pokemon.results.length).toBe(6);
      expect(pokemon.results.find(pokemon => pokemon.name == 'charizard')).not.toBeNull();
    });
    
    it('can filter pokemon by type from a specified start', async () => {
      const pokemonWithCharmanderline = await httpClient.get(`pokemon?types=fire&start=1`).json();
      expect(pokemonWithCharmanderline.results.length).toBe(71);
      expect(pokemonWithCharmanderline.results.find(pokemon => pokemon.name == 'charmander')).not.toBeNull();

      const pokemonWithoutCharmanderline = await httpClient.get(`pokemon?types=fire&start=10`).json();
      expect(pokemonWithoutCharmanderline.results.length).toBe(68);
      expect(pokemonWithoutCharmanderline.results.find(pokemon => pokemon.name == 'charmander')).toBeUndefined();
    });
    
    it('can filter pokemon by type with a limit', async () => {
      const pokemon = await httpClient.get(`pokemon?types=fire&limit=3`).json();
      expect(pokemon.results.length).toBe(3);
      expect(pokemon.results.find(pokemon => pokemon.name == 'charmander')).not.toBeNull();
    });
    
    it('can filter pokemon by type in combination with id(s)', async () => {
      let pokemon = await httpClient.get(`pokemon?types=fire&ids=4`).json();
      expect(pokemon.results.length).toBe(1);
      expect(pokemon.results.find(pokemon => pokemon.name == 'charmander')).not.toBeNull();

      pokemon = await httpClient.get(`pokemon?types=fire&ids=3,4,5`).json();
      expect(pokemon.results.length).toBe(2);
      expect(pokemon.results.find(pokemon => pokemon.name == 'charmander')).not.toBeNull();
      expect(pokemon.results.find(pokemon => pokemon.name == 'charmeleon')).not.toBeNull();

      pokemon = await httpClient.get(`pokemon?types=fire&ids=1,2,3`).json();
      expect(pokemon.results.length).toBe(0);
    });
    
    it('can filter pokemon by type in combination with name', async () => {
      let pokemon = await httpClient.get(`pokemon?types=fire&name=charmander`).json();
      expect(pokemon.results.length).toBe(1);
      expect(pokemon.results.find(pokemon => pokemon.name == 'charmander')).not.toBeNull();

      pokemon = await httpClient.get(`pokemon?types=fire&name=squirtle`).json();
      expect(pokemon.results.length).toBe(0);
    });

    it('recieves empty result for unknown type', async () => {
      const pokemon = await httpClient.get(`pokemon?types=unknownType`).json();
      expect(pokemon.results.length).toBe(0);
    });

    it('recieves an error if types are not in the expected format', async () => {
      expect.assertions(3);

      try {
        await httpClient.get(`pokemon?types=fire;flying`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }

      try {
        await httpClient.get(`pokemon?types=fire,2`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(422);
      }

      try {
        await httpClient.get(`pokemon?types=[fire,flying]`).json();
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
      expect(bulbasaur.types.grass).toBeTruthy();
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
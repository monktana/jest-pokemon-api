import got from 'got';
import { API_URL } from '../settings';


const httpClient = got.extend({
  prefixUrl: API_URL
});

describe('/types', () => {

  it('recieves all pokemon types', async () => {
    const types = await httpClient.get(`types`).json();

    expect(types.total).toBe(18);
    expect(types.results.length).toBe(18);
    
    expect(types.results[0].name).not.toBeNull();
    expect(types.results[0].url).not.toBeNull();
  });

  describe("single", () => {
    it('recieves bug for /1', async () => {
      const bugType = await httpClient.get(`types/1`).json();
  
      expect(bugType.id).toBe(1);
      expect(bugType.name).toBe('bug');
    });
  
    it('recieves bug for /bug', async () => {
      const bugType = await httpClient.get(`types/bug`).json();
  
      expect(bugType.id).toBe(1);
      expect(bugType.name).toBe('bug');
    });
  
    it('recieves 404 for /abc', async () => {
      try {
        await httpClient.get(`types/abc`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(404);
      }
    });
  
    it('recieves 404 for /1000', async () => {
      try {
        await httpClient.get(`types/100`).json();
      } catch (error) {
        expect(error.response.statusCode).toBe(404);
      }
    });
  })
});
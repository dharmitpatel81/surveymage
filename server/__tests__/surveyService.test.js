const surveyService = require('../services/surveyService');

jest.mock('../repositories/surveyRepository');
jest.mock('../repositories/responseRepository');
jest.mock('../utils/logger');

const surveyRepo = require('../repositories/surveyRepository');
const responseRepo = require('../repositories/responseRepository');

describe('surveyService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('listByUser', () => {
    it('returns surveys with response counts', async () => {
      const mockSurveys = [{ _id: 'id1', title: 'S1' }, { _id: 'id2', title: 'S2' }];
      surveyRepo.findByUser.mockResolvedValue(mockSurveys);
      surveyRepo.getResponseCounts.mockResolvedValue(new Map([['id1', 5], ['id2', 3]]));

      const result = await surveyService.listByUser('user1');

      expect(surveyRepo.findByUser).toHaveBeenCalledWith('user1');
      expect(result).toHaveLength(2);
      expect(result[0].responseCount).toBe(5);
      expect(result[0].questionCount).toBe(0);
    });
  });

  describe('getById', () => {
    it('returns survey when found', async () => {
      const mock = { _id: 'id1', title: 'S1' };
      surveyRepo.findById.mockResolvedValue(mock);

      const result = await surveyService.getById('id1', 'user1');

      expect(surveyRepo.findById).toHaveBeenCalledWith('id1', 'user1');
      expect(result).toEqual(mock);
    });

    it('returns null when not found', async () => {
      surveyRepo.findById.mockResolvedValue(null);

      const result = await surveyService.getById('id1', 'user1');

      expect(result).toBeNull();
    });
  });
});

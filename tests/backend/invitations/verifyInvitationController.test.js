import { jest, describe, beforeEach, test, expect } from '@jest/globals';

// Mock pool.query
let mockPoolQuery; // Will be initialized in beforeEach
let verifyInvitationController; // Will hold the dynamically imported controller

beforeEach(async () => {
  jest.clearAllMocks();
  jest.resetModules(); // Important for fresh mocks with ES Modules

  // Initialize mock function for this test run
  mockPoolQuery = jest.fn();

  // Re-mock and re-import for each test
  jest.unstable_mockModule('../../../backend/db.js', () => ({
    __esModule: true, // Indicate it's an ES module mock
    default: {
      query: mockPoolQuery, // Use the initialized mockPoolQuery
    },
  }));

  // pool = (await import('../../../backend/db.js')).default; // Not strictly needed if only using mockPoolQuery
  const controllerModule = await import('../../../backend/controllers/invitations/verifyInvitationController.js');
  verifyInvitationController = controllerModule.verifyInvitationController;
});

describe('verifyInvitationController', () => {
  let req;
  let res;

  beforeEach(() => {
    // Clear mock history before each test within this describe block
    mockPoolQuery.mockClear();

    req = {
      params: { token: 'test-token' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test('should return 200 and invitation details for a valid token', async () => {
    const dbRow = {
      invitee_email: 'test@example.com',
      project_name: 'Test Project',
      inviter_first_name: 'Inviter',
      inviter_last_name: 'User',
    };
    const expectedResponse = {
      invitee_email: 'test@example.com',
      project_name: 'Test Project',
      inviter_name: 'Inviter User',
    };
    mockPoolQuery.mockResolvedValueOnce({ rows: [dbRow], rowCount: 1 });

    await verifyInvitationController(req, res);

    expect(mockPoolQuery).toHaveBeenCalledTimes(1);
    expect(mockPoolQuery).toHaveBeenCalledWith(expect.any(String), [req.params.token]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expectedResponse);
  });

  test('should return 404 if token is not found', async () => {
    mockPoolQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Simulate token not found

    await verifyInvitationController(req, res);

    expect(mockPoolQuery).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invitation not found, is expired, or has already been accepted.' });
  });

  test('should return 404 if token parameter is undefined (leading to no rows found)', async () => {
    req.params.token = undefined; // Simulate undefined token
    // pool.query(query, [undefined]) will likely find no matching token
    mockPoolQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    await verifyInvitationController(req, res);

    expect(mockPoolQuery).toHaveBeenCalledTimes(1); // DB call is made with undefined token
    expect(mockPoolQuery).toHaveBeenCalledWith(expect.any(String), [undefined]);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invitation not found, is expired, or has already been accepted.' });
  });

  test('should return 500 if a database error occurs', async () => {
    mockPoolQuery.mockRejectedValueOnce(new Error('Database connection error'));

    await verifyInvitationController(req, res);

    expect(mockPoolQuery).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' }); // Matches controller's generic error
  });
});

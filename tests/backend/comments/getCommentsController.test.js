import { jest, describe, beforeEach, test, expect } from '@jest/globals';

describe('getCommentsController', () => {
  let req;
  let res;
  let pool;
  let getCommentsController;

  beforeEach(async () => {
    // Mock db.js
    jest.unstable_mockModule('../../../backend/db.js', () => ({
      __esModule: true,
      default: {
        query: jest.fn(),
      },
    }));

    // Dynamically import mocked pool and the controller
    const dbModule = await import('../../../backend/db.js');
    pool = dbModule.default;

    const controllerModule = await import('../../../backend/controllers/comments/getCommentsController.js');
    getCommentsController = controllerModule.getCommentsController;

    // Clear mock calls
    if (pool && pool.query && typeof pool.query.mockClear === 'function') {
      pool.query.mockClear();
    }

    // Setup req and res objects
    req = {
      params: { taskId: 'task1' },
      user: { id: 'user1' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test('should fetch comments successfully and return 200', async () => {
    const mockComments = [
      { id: 'comment1', content: 'First comment', user_id: 'user1', first_name: 'Test', last_name: 'User' },
      { id: 'comment2', content: 'Second comment', user_id: 'user2', first_name: 'Another', last_name: 'User' },
    ];

    // Mock access check query
    pool.query.mockResolvedValueOnce({ rows: [{ project_id: 'project1' }] });
    // Mock comments query
    pool.query.mockResolvedValueOnce({ rows: mockComments });

    await getCommentsController(req, res);

    expect(pool.query).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockComments);
  });

  test('should return 403 if user does not have access to the task', async () => {
    // Mock access check query to return no rows (no access)
    pool.query.mockResolvedValueOnce({ rows: [] });

    await getCommentsController(req, res);

    expect(pool.query).toHaveBeenCalledTimes(1); // Only access check query should be called
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'You do not have access to this task.' });
  });

  test('should return 500 if a database error occurs during access check', async () => {
    // Simulate database error on the first query (access check)
    pool.query.mockRejectedValueOnce(new Error('DB error on access check'));

    await getCommentsController(req, res);

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error.' });
  });

  test('should return 500 if a database error occurs when fetching comments', async () => {
    // Mock access check query - successful
    pool.query.mockResolvedValueOnce({ rows: [{ project_id: 'project1' }] });
    // Simulate database error on the second query (fetching comments)
    pool.query.mockRejectedValueOnce(new Error('DB error fetching comments'));

    await getCommentsController(req, res);

    expect(pool.query).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error.' });
  });
});

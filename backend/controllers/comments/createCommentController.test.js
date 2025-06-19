import { jest, describe, beforeEach, test, expect } from '@jest/globals';
// import { createCommentController } from './createCommentController'; // Removed static import

// Mock the pool.query method
// jest.mock('../../db.js', () => ({ // Moved to beforeEach with unstable_mockModule
//   __esModule: true,
//   default: {
//     query: jest.fn(),
//   }
// }));

describe('createCommentController', () => {
  let req;
  let res;
  let pool; // This will hold the mocked pool
  let createCommentController; // To hold the dynamically imported controller

  beforeEach(async () => {
    // Use jest.unstable_mockModule for ESM
    jest.unstable_mockModule('../../db.js', () => ({
      __esModule: true,
      default: {
        query: jest.fn(),
      },
    }));

    // Dynamically import the mocked pool AFTER defining the mock
    const dbModule = await import('../../db.js');
    pool = dbModule.default;

    // Dynamically import the controller *after* db.js is mocked
    const controllerModule = await import('./createCommentController.js');
    createCommentController = controllerModule.createCommentController;

    // Clear any previous mock calls for pool.query
    if (pool && pool.query && typeof pool.query.mockClear === 'function') {
        pool.query.mockClear();
    } else {
        console.error('pool.query is not a mock function in beforeEach after unstable_mockModule.');
        // throw new Error('Mock setup failed: pool.query is not a jest function.');
    }

    req = {
      params: { taskId: 'task1' },
      body: { content: 'Test comment' },
      user: { id: 'user1' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test('should create a comment and return 201', async () => {
    // Mock database responses
    pool.query
      .mockResolvedValueOnce({ rows: [{ project_id: 'project1' }] }) // Access check
      .mockResolvedValueOnce({ rows: [{ id: 'comment1', content: 'Test comment', task_id: 'task1', user_id: 'user1' }] }) // Insert comment
      .mockResolvedValueOnce({ rows: [{ id: 'comment1', content: 'Test comment', task_id: 'task1', user_id: 'user1', first_name: 'Test', last_name: 'User', photo_url: 'url' }] }); // Final comment query

    await createCommentController(req, res);

    expect(pool.query).toHaveBeenCalledTimes(3);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      id: 'comment1',
      content: 'Test comment',
    }));
  });

  test('should return 400 if content is missing', async () => {
    req.body.content = ''; // Missing content

    await createCommentController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Comment content cannot be empty.' });
  });

  test('should return 403 if user does not have access', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }); // Simulate no access

    await createCommentController(req, res);

    expect(pool.query).toHaveBeenCalledTimes(1); // Only access check query should be called
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'You do not have access to this task.' });
  });

  test('should return 500 if database error occurs', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database error')); // Simulate database error

    await createCommentController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error.' });
  });
});

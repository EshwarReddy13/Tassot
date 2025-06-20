import { jest, describe, beforeEach, test, expect } from '@jest/globals';

// Define mock functions at the top level of the module
let mockPoolQuery;
let mockCryptoRandomBytes;
let createInvitationController; // Will hold the dynamically imported controller

beforeEach(async () => {
  // Reset modules to ensure mocks are applied fresh for each test
  jest.resetModules();

  // Initialize mock function instances for each test run
  mockPoolQuery = jest.fn();
  mockCryptoRandomBytes = jest.fn().mockReturnValue({ toString: () => 'mocked-crypto-token' });

  // Mock 'db.js' to use mockPoolQuery for pool.query
  jest.unstable_mockModule('../../../backend/db.js', () => ({
    __esModule: true,
    default: {
      query: mockPoolQuery,
    },
  }));

  // Mock 'crypto' to control crypto.randomBytes
  jest.unstable_mockModule('crypto', () => ({
    __esModule: true,
    default: {
      randomBytes: mockCryptoRandomBytes
    },
  }));

  // Dynamically import the controller *after* all mocks are set up
  const controllerModule = await import('../../../backend/controllers/invitations/createInvitationController.js');
  createInvitationController = controllerModule.createInvitationController;

  // Clear mocks (call history, etc.) after setup and before each test logic runs.
  // Note: mockClear is generally preferred over mockReset for just clearing history.
  mockPoolQuery.mockClear();
  mockCryptoRandomBytes.mockClear();
  // Re-assign default mock behavior if it could be changed by a test
  mockCryptoRandomBytes.mockReturnValue({ toString: () => 'mocked-crypto-token' });
});

describe('createInvitationController', () => {
  let req;
  let res;

  beforeEach(() => {
    // Common setup for req and res objects
    req = {
      params: { projectUrl: 'project-url-123' },
      body: { invitee_email: 'test@example.com' },
      user: { id: 'user_owner_id', email: 'inviter@example.com' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test('should successfully create an invitation and return 201', async () => {
    mockPoolQuery
      .mockResolvedValueOnce({ rows: [{ id: 'project1', project_name: 'Test Project', owner_id: 'user_owner_id' }] }) // Get project details
      .mockResolvedValueOnce({ rows: [] }) // User not already member
      .mockResolvedValueOnce({ rows: [] }) // No pending invitation
      .mockResolvedValueOnce({ rows: [{ /* insert result */ }] }); // Insert invitation

    await createInvitationController(req, res);

    expect(mockPoolQuery).toHaveBeenCalledTimes(4);
    expect(mockPoolQuery.mock.calls[0][0]).toContain('SELECT id, project_name, owner_id FROM projects WHERE project_url = $1');
    expect(mockPoolQuery.mock.calls[1][0]).toContain('SELECT u.id FROM users u');
    expect(mockPoolQuery.mock.calls[2][0]).toContain('SELECT id FROM invitations WHERE project_id = $1 AND invitee_email = $2 AND status = \'pending\'');
    expect(mockPoolQuery.mock.calls[3][0]).toContain('INSERT INTO invitations');
    expect(mockPoolQuery.mock.calls[3][1]).toEqual(['mocked-crypto-token', 'project1', 'test@example.com', 'user_owner_id']);

    expect(mockCryptoRandomBytes).toHaveBeenCalledWith(32);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invitation sent successfully.' });
  });

  test('should return 400 if invitee_email is missing', async () => {
    req.body.invitee_email = '';
    await createInvitationController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invitee email is required.' });
    expect(mockPoolQuery).not.toHaveBeenCalled();
  });

  test('should return 404 if project not found', async () => {
    mockPoolQuery.mockResolvedValueOnce({ rows: [] }); // Project not found

    await createInvitationController(req, res);
    expect(mockPoolQuery).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Project not found.' });
  });

  test('should return 403 if inviter is not the project owner', async () => {
    mockPoolQuery.mockResolvedValueOnce({ rows: [{ id: 'project1', owner_id: 'another_user_id' }] }); // Inviter is not owner

    await createInvitationController(req, res);
    expect(mockPoolQuery).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: Only the project owner can send invitations.' });
  });

  test('should return 409 if invitee is already a project member', async () => {
    mockPoolQuery
      .mockResolvedValueOnce({ rows: [{ id: 'project1', owner_id: 'user_owner_id' }] }) // Project details
      .mockResolvedValueOnce({ rows: [{ user_id: 'invitee_user_id' }] }); // User already member

    await createInvitationController(req, res);
    expect(mockPoolQuery).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'This user is already a member of the project.' });
  });

  test('should return 409 if invitee already has a pending invitation', async () => {
    mockPoolQuery
      .mockResolvedValueOnce({ rows: [{ id: 'project1', owner_id: 'user_owner_id' }] }) // Project details
      .mockResolvedValueOnce({ rows: [] }) // Not an existing member
      .mockResolvedValueOnce({ rows: [{ id: 'existing_invite_id' }] }); // Pending invitation exists

    await createInvitationController(req, res);
    expect(mockPoolQuery).toHaveBeenCalledTimes(3);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'An invitation is already pending for this email address.' });
  });

  test('should return 500 if database error occurs during project query', async () => {
    mockPoolQuery.mockRejectedValueOnce(new Error('DB error on project query'));

    await createInvitationController(req, res);
    expect(mockPoolQuery).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });

  test('should return 500 if database error occurs during invitation insertion', async () => {
    mockPoolQuery
      .mockResolvedValueOnce({ rows: [{ id: 'project1', owner_id: 'user_owner_id' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockRejectedValueOnce(new Error('DB error on insert')); // Insert invitation fails

    await createInvitationController(req, res);
    expect(mockPoolQuery).toHaveBeenCalledTimes(4);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});

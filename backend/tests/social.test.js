const SocialController = require('../src/controllers/SocialController');
const Comment = require('../models/Comment');
const Battle = require('../models/Battle');
const httpMocks = require('node-mocks-http');

jest.mock('../models/Comment');
jest.mock('../models/Battle');

describe('SocialController', () => {
    let req, res, next;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        next = jest.fn();

        // Mock socket io
        req.app = {
            get: jest.fn().mockReturnValue({
                to: jest.fn().mockReturnValue({
                    emit: jest.fn()
                })
            })
        };

        jest.clearAllMocks();
    });

    describe('postComment', () => {
        it('should create a comment if nickname is valid', async () => {
            req.params.id = 'battle-123';
            req.body = {
                fingerprint: 'user-1',
                content: 'Hello World',
                nickname: 'Hero'
            };

            // Mock no conflict: findOne returns null directly (awaiting it)
            Comment.findOne.mockResolvedValue(null);

            // Mock Battle exists
            Battle.findOne.mockResolvedValue({
                battleId: 'battle-123',
                votes: new Map()
            });

            const saveMock = jest.fn().mockResolvedValue({
                nickname: 'Hero',
                content: 'Hello World'
            });
            Comment.mockImplementation((data) => ({
                ...data, // Include the data passed to constructor
                save: saveMock
            }));

            await SocialController.postComment(req, res);

            expect(res.statusCode).toBe(201);
            expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
                nickname: 'Hero'
            }));
        });

        it('should return 400 if nickname is taken by another user', async () => {
            req.params.id = 'battle-123';
            req.body = {
                fingerprint: 'user-2', // Different user
                content: 'Stealing name',
                nickname: 'Hero'
            };

            // Mock conflict found: return document directly
            Comment.findOne.mockResolvedValue({
                nickname: 'Hero',
                fingerprint: 'user-1' // Owned by user-1
            });

            // Controller checks if conflict exists. If it exists, it returns 400.

            await SocialController.postComment(req, res);

            expect(res.statusCode).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: expect.stringContaining('El apodo "Hero" ya está en uso')
            });
        });

        it('should allow reusing own nickname', async () => {
            req.params.id = 'battle-123';
            req.body = {
                fingerprint: 'user-1', // Same user
                content: 'Another message',
                nickname: 'Hero'
            };

            // In the new logic, findOne uses { fingerprint: { $ne: fingerprint } }
            // So if I am user-1, finding someone ELSE with 'Hero' returns NULL (no one else has it).
            // If I have it, I am excluded from query.

            Comment.findOne.mockResolvedValue(null);

            Battle.findOne.mockResolvedValue({
                battleId: 'battle-123'
            });

            const saveMock = jest.fn().mockResolvedValue({
                nickname: 'Hero',
                content: 'Another message'
            });
            Comment.mockImplementation(() => ({
                save: saveMock
            }));

            await SocialController.postComment(req, res);

            expect(res.statusCode).toBe(201);
        });
    });
});

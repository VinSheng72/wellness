import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { UsersRepository } from '../users.repository';
import { Types } from 'mongoose';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  const mockUser = {
    _id: new Types.ObjectId(),
    username: 'testuser',
    password: 'hashedpassword',
    role: 'HR_ADMIN',
    companyId: new Types.ObjectId(),
  };

  const mockRepository = {
    findByUsername: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      mockRepository.findByUsername.mockResolvedValue(mockUser);

      const result = await service.findByUsername('testuser');

      expect(result).toEqual(mockUser);
      expect(repository.findByUsername).toHaveBeenCalledWith('testuser');
    });

    it('should return null if user not found', async () => {
      mockRepository.findByUsername.mockResolvedValue(null);

      const result = await service.findByUsername('nonexistent');

      expect(result).toBeNull();
      expect(repository.findByUsername).toHaveBeenCalledWith('nonexistent');
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const id = mockUser._id.toString();
      mockRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById(id);

      expect(result).toEqual(mockUser);
      expect(repository.findById).toHaveBeenCalledWith(id);
    });

    it('should return null if user not found', async () => {
      const id = new Types.ObjectId().toString();
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.findById(id);

      expect(result).toBeNull();
      expect(repository.findById).toHaveBeenCalledWith(id);
    });
  });
});

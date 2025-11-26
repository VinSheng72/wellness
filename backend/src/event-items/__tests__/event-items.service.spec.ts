import { Test, TestingModule } from '@nestjs/testing';
import { EventItemsService } from '../event-items.service';
import { EventItemsRepository } from '../event-items.repository';
import { Types } from 'mongoose';

describe('EventItemsService', () => {
  let service: EventItemsService;
  let repository: EventItemsRepository;

  const mockEventItem = {
    _id: new Types.ObjectId(),
    name: 'Yoga Session',
    description: 'Relaxing yoga session',
    vendorId: new Types.ObjectId(),
    category: 'Wellness',
    price: 50,
    duration: 60,
  };

  const mockRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventItemsService,
        {
          provide: EventItemsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EventItemsService>(EventItemsService);
    repository = module.get<EventItemsRepository>(EventItemsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all event items', async () => {
      const eventItems = [mockEventItem];
      mockRepository.findAll.mockResolvedValue(eventItems);

      const result = await service.findAll();

      expect(result).toEqual(eventItems);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return an event item by id', async () => {
      const id = mockEventItem._id.toString();
      mockRepository.findById.mockResolvedValue(mockEventItem);

      const result = await service.findById(id);

      expect(result).toEqual(mockEventItem);
      expect(repository.findById).toHaveBeenCalledWith(id);
    });

    it('should return null if event item not found', async () => {
      const id = new Types.ObjectId().toString();
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.findById(id);

      expect(result).toBeNull();
      expect(repository.findById).toHaveBeenCalledWith(id);
    });
  });
});

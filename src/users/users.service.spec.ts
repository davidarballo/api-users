import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserModel = {
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'UserModel',
          useValue: mockUserModel,
        },
      ],
    })
      .overrideProvider('UserModel')
      .useValue(mockUserModel)
      .compile();

    service = module.get<UsersService>(UsersService);
  });

  it('debería crear un usuario', async () => {
    const user = { name: 'David', email: 'test@test.com' };
    mockUserModel.create.mockResolvedValue(user);

    const result = await service.create(user);

    expect(result).toEqual(user);
    expect(mockUserModel.create).toHaveBeenCalled();
  });
});
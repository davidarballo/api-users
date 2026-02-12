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
    const created = { _id: '1', name: 'David', email: 'test@test.com' };
    mockUserModel.create.mockResolvedValue(created);

    const result = await service.create({
      name: 'David',
      email: 'test@test.com',
      password: '123456',
    });

    expect(result).toEqual({ id: '1', name: 'David', email: 'test@test.com' });
    expect(mockUserModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'David',
        email: 'test@test.com',
        password: expect.any(String),
      }),
    );
  });
});

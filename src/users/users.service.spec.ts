import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserModel = {
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
  };
  const mockProfileModel = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'UserModel',
          useValue: mockUserModel,
        },
        {
          provide: 'ProfileModel',
          useValue: mockProfileModel,
        },
      ],
    })
      .overrideProvider('UserModel')
      .useValue(mockUserModel)
      .overrideProvider('ProfileModel')
      .useValue(mockProfileModel)
      .compile();

    service = module.get<UsersService>(UsersService);
  });

  it('debería crear un usuario', async () => {
    const createdProfile = {
      _id: 'profile-1',
      firstName: 'David',
      lastName: 'Perez',
      city: 'Buenos Aires',
    };
    const created = { _id: '1', email: 'test@test.com' };
    mockProfileModel.create.mockResolvedValue(createdProfile);
    mockUserModel.create.mockResolvedValue(created);

    const result = await service.create({
      email: 'test@test.com',
      password: '123456',
      profile: {
        firstName: 'David',
        lastName: 'Perez',
        city: 'Buenos Aires',
      },
    });

    expect(result).toEqual({
      id: '1',
      email: 'test@test.com',
      profile: createdProfile,
    });
    expect(mockProfileModel.create).toHaveBeenCalledWith({
      firstName: 'David',
      lastName: 'Perez',
      city: 'Buenos Aires',
    });
    expect(mockUserModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@test.com',
        password: expect.any(String),
        profile: createdProfile._id,
      }),
    );
  });
});

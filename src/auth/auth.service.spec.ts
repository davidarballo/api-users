import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserModel: any = {
    findOne: jest.fn(),
  };
  const mockProfileModel: any = {
    create: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('token'),
  };

  beforeEach(() => {
    service = new AuthService(mockUserModel, mockProfileModel, mockJwtService as any);
  });

  it('login válido devuelve token', async () => {
    const password = await bcrypt.hash('123456', 10);

    mockUserModel.findOne.mockReturnValue({
      select: () => ({
        password,
        email: 'test@test.com',
        _id: '1',
      }),
    });

    const result = await service.login({
      email: 'test@test.com',
      password: '123456',
    });

    expect(result.accessToken).toBe('token');
  });
});

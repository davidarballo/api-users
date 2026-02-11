import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User, UserDocument } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password, 10);

    try {
      const created = await this.userModel.create({
        name: dto.name,
        email: dto.email,
        password: hashed,
      });

      return { id: created._id, name: created.name, email: created.email };
    } catch (error: any) {
      if (error?.code === 11000) throw new ConflictException('El email ya está registrado');
      throw error;
    }
  }

  async login(dto: LoginDto) {
    // OJO: password tiene select:false, hay que pedirlo explícitamente
    const user = await this.userModel.findOne({ email: dto.email }).select('+password');
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: user._id.toString(), email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }
}
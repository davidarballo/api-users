import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
    ) { }

    async create(data: CreateUserDto) {
        const hashed = await bcrypt.hash(data.password, 10);
        try {
            const created = await this.userModel.create({
                name: data.name,
                email: data.email,
                password: hashed,
            });

            return { id: created._id, name: created.name, email: created.email };
        } catch (error) {
            if (error?.code === 11000) {
                throw new ConflictException('El email ya está registrado');
            }
            throw error;
        }
    }
    async findAll(query: ListUsersDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (query.search && query.search.trim() !== '') {
            const s = query.search.trim();
            filter.$or = [
                { name: { $regex: s, $options: 'i' } },
                { email: { $regex: s, $options: 'i' } },
            ];
        }

        const sortBy = query.sortBy ?? 'createdAt';
        const sortDir = query.sortDir === 'asc' ? 1 : -1;

        const [data, total] = await Promise.all([
            this.userModel.find(filter).sort({ [sortBy]: sortDir }).skip(skip).limit(limit),
            this.userModel.countDocuments(filter),
        ]);

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('ID inválido');
        }

        const user = await this.userModel.findById(id);

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return user;
    }

    async update(id: string, data: UpdateUserDto) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('ID inválido');
        }

        try {
            const user = await this.userModel.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            });

            if (!user) {
                throw new NotFoundException('Usuario no encontrado');
            }

            return user;
        } catch (error) {
            if (error?.code === 11000) {
                throw new ConflictException('El email ya está registrado');
            }
            throw error;
        }
    }

    async remove(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('ID inválido');
        }

        const user = await this.userModel.findByIdAndDelete(id);

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return { message: 'Usuario eliminado correctamente' };
    }
}

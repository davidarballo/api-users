import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { ListUsersDto } from './dto/list-users.dto';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
    ) { }

    async create(data: any) {
        try {
            return await this.userModel.create(data);
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

    async update(id: string, data: any) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('ID inválido');
        }

        const user = await this.userModel.findByIdAndUpdate(id, data, { new: true });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return user;
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
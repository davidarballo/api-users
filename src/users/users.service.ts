import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { Profile, ProfileDocument } from './schemas/profile.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        @InjectModel(Profile.name)
        private profileModel: Model<ProfileDocument>,
    ) { }

    async create(data: CreateUserDto) {
        const { profile, ...userData } = data;
        const hashed = await bcrypt.hash(userData.password, 10);
        try {
            const createdProfile = await this.profileModel.create(profile);
            const created = await this.userModel.create({
                email: userData.email,
                password: hashed,
                profile: createdProfile._id,
            });

            return {
                id: created._id,
                email: created.email,
                profile: createdProfile,
            };
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
                { email: { $regex: s, $options: 'i' } },
            ];
        }

        const sortBy = query.sortBy ?? 'createdAt';
        const sortDir = query.sortDir === 'asc' ? 1 : -1;

        const [data, total] = await Promise.all([
            this.userModel
                .find(filter)
                .populate('profile')
                .sort({ [sortBy]: sortDir })
                .skip(skip)
                .limit(limit),
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

        const user = await this.userModel.findById(id).populate('profile');

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
            const existing = await this.userModel.findById(id);
            if (!existing) {
                throw new NotFoundException('Usuario no encontrado');
            }

            const { profile, password, ...rest } = data;
            const userData: {
                email?: string;
                password?: string;
                profile?: Types.ObjectId;
            } = { ...rest };
            if (password) {
                userData.password = await bcrypt.hash(password, 10);
            }

            if (profile) {
                if (existing.profile) {
                    await this.profileModel.findByIdAndUpdate(existing.profile, profile, {
                        new: true,
                        runValidators: true,
                    });
                } else {
                    const createdProfile = await this.profileModel.create(profile);
                    userData.profile = createdProfile._id;
                }
            }

            const user = await this.userModel.findByIdAndUpdate(id, userData, {
                new: true,
                runValidators: true,
            }).populate('profile');

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

        if (user.profile) {
            await this.profileModel.findByIdAndDelete(user.profile);
        }

        return { message: 'Usuario eliminado correctamente' };
    }
}

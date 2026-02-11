import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { ListUsersDto } from './dto/list-users.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
    ) { }

    create(data: Partial<User>) {
        return this.userModel.create(data);
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
    findById(id: string) {
        return this.userModel.findById(id);
    }

    update(id: string, data: any) {
        return this.userModel.findByIdAndUpdate(id, data, { new: true });
    }

    remove(id: string) {
        return this.userModel.findByIdAndDelete(id);
    }
}
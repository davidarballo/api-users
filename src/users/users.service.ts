import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
    ) { }

    create(data: Partial<User>) {
        return this.userModel.create(data);
    }

    findAll() {
        return this.userModel.find();
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
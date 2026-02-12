import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Profile } from './profile.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;
  
  @Prop({ required: true, select: false }) 
  password: string;

  @Prop({ type: Types.ObjectId, ref: Profile.name })
  profile?: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);

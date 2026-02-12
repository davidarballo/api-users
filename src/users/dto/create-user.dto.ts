import { IsDefined, IsEmail, IsString, MinLength, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateProfileDto } from './create-profile.dto';

export class CreateUserDto {
    @ApiProperty({ example: 'david@test.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Password123!' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ type: CreateProfileDto })
    @IsDefined()
    @ValidateNested()
    @Type(() => CreateProfileDto)
    profile: CreateProfileDto;
}

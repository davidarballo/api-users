import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'David' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'david@test.com' })
    @IsEmail()
    email: string;
}
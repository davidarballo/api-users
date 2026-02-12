import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'David' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'david@test.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Password123!' })
    @IsString()
    @MinLength(6)
    password: string;
}

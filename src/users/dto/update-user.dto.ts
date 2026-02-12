import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { UpdateProfileDto } from './update-profile.dto';


export class UpdateUserDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ required: false, minLength: 6 })
    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @ApiProperty({ required: false, type: UpdateProfileDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateProfileDto)
    profile?: UpdateProfileDto;
}

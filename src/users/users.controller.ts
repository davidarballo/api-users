import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Param, Put, Delete } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { Query } from '@nestjs/common';
import { ListUsersDto } from './dto/list-users.dto';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Post()
    create(@Body() body: CreateUserDto) {
        return this.usersService.create(body);
    }
    @Get()
    findAll(@Query() query: ListUsersDto) {
        return this.usersService.findAll(query);
    }
    @Get(':id')
    findById(@Param('id') id: string) {
        return this.usersService.findById(id);
    }
    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() body: UpdateUserDto,
    ) {
        return this.usersService.update(id, body);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
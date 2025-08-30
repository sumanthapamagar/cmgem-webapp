import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, NotFoundException } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './accounts.schema';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async findAll(@Query('search') search?: string): Promise<Account[]> {
    return this.accountsService.findAll({ search });
  }

  @Get('search')
  async searchByName(@Query('q') query: string): Promise<Account[]> {
    return this.accountsService.searchByName(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Account> {
    return this.accountsService.findById(id);
  }

  @Post()
  async create(@Body() createAccountDto: CreateAccountDto): Promise<Account> {
    return this.accountsService.create(createAccountDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: CreateAccountDto,
  ): Promise<Account> {
    return this.accountsService.update(id, updateAccountDto);
  }

  @Patch(':id')
  async partialUpdate(
    @Param('id') id: string,
    @Body() updateAccountDto: CreateAccountDto,
  ): Promise<Account> {
    return this.accountsService.update(id, updateAccountDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.accountsService.delete(id);
    return { message: 'Account deleted successfully' };
  }

}

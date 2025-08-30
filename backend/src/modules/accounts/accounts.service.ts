import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Account, AccountDocument } from './accounts.schema';
import { CreateAccountDto } from './dto/create-account.dto';

export interface SearchOptions {
  search?: string;
}

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name, 'default') private accountModel: Model<AccountDocument>,
  ) {}

  async findAll(options: SearchOptions = {}): Promise<Account[]> {
    const { search } = options;
    
    let filter: any = { deleted_at: { $exists: false } };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.state': { $regex: search, $options: 'i' } },
        { 'address.country': { $regex: search, $options: 'i' } },
      ];
    }

    return this.accountModel
      .find(filter)
      .sort({ name: 1 }) // Sort alphabetically by name
      .exec();
  }

  async findById(id: string): Promise<Account> {
    const account = await this.accountModel.findOne({ 
      _id: new Types.ObjectId(id),
      deleted_at: { $exists: false }
    }).exec();
    
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return account;
  }

  async findByName(name: string): Promise<Account | null> {
    return this.accountModel.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      deleted_at: { $exists: false }
    }).exec();
  }

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    // Check if account with same name already exists
    const existingAccount = await this.findByName(createAccountDto.name);
    if (existingAccount) {
      throw new ConflictException(`Account with name "${createAccountDto.name}" already exists`);
    }

    const createdAccount = new this.accountModel(createAccountDto);
    return createdAccount.save();
  }

  async update(id: string, updateAccountDto: CreateAccountDto): Promise<Account> {
    // If name is being updated, check for duplicates


    const updatedAccount = await this.accountModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { ...updateAccountDto, updated_at: new Date() },
      { new: true, runValidators: true }
    ).exec();

    if (!updatedAccount) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return updatedAccount;
  }

  async delete(id: string): Promise<void> {
    const result = await this.accountModel.findByIdAndUpdate(
      id,
      { deleted_at: new Date() }
    ).exec();

    if (!result) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
  }

  async hardDelete(id: string): Promise<void> {
    const result = await this.accountModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
  }

  async searchByName(searchTerm: string): Promise<Account[]> {
    return this.findAll({ search: searchTerm });
  }

  async findByLocation(city?: string, state?: string, country?: string): Promise<Account[]> {
    let filter: any = { deleted_at: { $exists: false } };
    
    if (city || state || country) {
      filter.address = {};
      if (city) filter.address.city = { $regex: city, $options: 'i' };
      if (state) filter.address.state = { $regex: state, $options: 'i' };
      if (country) filter.address.country = { $regex: country, $options: 'i' };
    }

    return this.accountModel
      .find(filter)
      .sort({ name: 1 })
      .exec();
  }

  async getAccountCount(): Promise<number> {
    return this.accountModel.countDocuments({ deleted_at: { $exists: false } }).exec();
  }

  async getAccountsByFirstLetter(letter: string): Promise<Account[]> {
    const regex = new RegExp(`^${letter}`, 'i');
    return this.accountModel
      .find({ 
        name: regex,
        deleted_at: { $exists: false }
      })
      .sort({ name: 1 })
      .exec();
  }

  async getUniqueCities(): Promise<string[]> {
    const cities = await this.accountModel
      .distinct('address.city', { deleted_at: { $exists: false } })
      .exec();
    return cities.filter(city => city).sort();
  }

  async getUniqueStates(): Promise<string[]> {
    const states = await this.accountModel
      .distinct('address.state', { deleted_at: { $exists: false } })
      .exec();
    return states.filter(state => state).sort();
  }

  async getUniqueCountries(): Promise<string[]> {
    const countries = await this.accountModel
      .distinct('address.country', { deleted_at: { $exists: false } })
      .exec();
    return countries.filter(country => country).sort();
  }

  async getLocationStats(): Promise<{
    cities: string[];
    states: string[];
    countries: string[];
    totalAccounts: number;
  }> {
    const [cities, states, countries, totalAccounts] = await Promise.all([
      this.getUniqueCities(),
      this.getUniqueStates(),
      this.getUniqueCountries(),
      this.getAccountCount(),
    ]);

    return {
      cities,
      states,
      countries,
      totalAccounts,
    };
  }
}

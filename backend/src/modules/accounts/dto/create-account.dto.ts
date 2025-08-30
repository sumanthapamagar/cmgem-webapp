import { IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString()
  street_1: string;

  @IsOptional()
  @IsString()
  street_2?: string;

  @IsString()
  city: string;

  @IsString()
  post_code: string;

  @IsString()
  state: string;

  @IsString()
  country: string;
}

export class CreateAccountDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  fax?: string;

  @IsOptional()
  @IsString()
  website?: string;
}

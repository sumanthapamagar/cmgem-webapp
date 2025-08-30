import { Type } from 'class-transformer';
import { IsString, IsOptional, IsDateString, IsMongoId, IsObject, ValidateNested } from 'class-validator';

export class AddressDto {
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

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsMongoId()
  account_id: string;

  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsDateString()
  inspection_date: string;

  @IsOptional()
  is_test?: boolean;
}

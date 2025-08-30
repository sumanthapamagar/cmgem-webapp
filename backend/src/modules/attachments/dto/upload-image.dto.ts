import { IsOptional, IsString } from 'class-validator';

export class UploadImageDto {
  @IsOptional()
  @IsString()
  group_id?: string;

  @IsOptional()
  @IsString()
  inspection_item?: string;

}

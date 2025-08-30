import { EquipmentResponseDto } from './equipment-response.dto';
import { FloorResponseDto } from '../../floors/dto/floor-response.dto';

export class BulkSaveResultDto {
  equipment: EquipmentResponseDto;
  floors: FloorResponseDto[];
  action: 'created' | 'updated';
}

export class BulkSaveEquipmentsResponseDto {
  results: BulkSaveResultDto[];
  summary: {
    total_processed: number;
    created: number;
    updated: number;
    errors: string[];
  };
}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FloorsService } from './floors.service';
import { Floor, FloorSchema } from './floors.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Floor.name, schema: FloorSchema }
    ], 'default')
  ],
  providers: [FloorsService],
  exports: [FloorsService],
})
export class FloorsModule {}

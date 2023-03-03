import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Availability } from './availability.entity';
import { AvailabilityService } from './availability.service';

@Module({
  imports: [TypeOrmModule.forFeature([Availability])],
  controllers: [],
  providers: [AvailabilityService],
})
export class ContentModule {}

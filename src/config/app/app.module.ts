import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AccountModule } from '../../models/accounts/account.module';
import { NotionModule } from '../../providers/notion/notion.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ContentModule } from '../../models/content/content.module';
import { AllExceptionsFilter } from '../../shared/exceptions';
import { AuthModule } from '../../auth/auth.module';
import {
  Content,
  ContentRepository,
} from '../../models/content/content.entity';
import {
  Availability,
  AvailabilityRepository,
} from '../../models/availability/availability.entity';
import { Job, JobRepository } from '../../models/job/job.entity';
import {
  Schedule,
  ScheduleRepository,
} from '../../models/schedule/schedule.entity';
import { AppService } from './app.service';
import {
  Account,
  AccountRepository,
} from '../../models/accounts/account.entity';
import { InsightsModule } from '../../providers/insights/insights.module';

@Module({
  imports: [
    ContentModule,
    AccountModule,
    InsightsModule,
    NotionModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [Account, Content, Availability, Job, Schedule],
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      AccountRepository,
      Account,
      ContentRepository,
      Content,
      Availability,
      AvailabilityRepository,
      Job,
      JobRepository,
      Schedule,
      ScheduleRepository,
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: AllExceptionsFilter, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AllExceptionsFilter } from '../../shared/exceptions';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  Account,
  AccountRepository,
} from '../../models/accounts/account.entity';
import { AccountModule } from '../../models/accounts/account.module';
import {
  Availability,
  AvailabilityRepository,
} from '../../models/availability/availability.entity';
import { CalendarModule } from '../../providers/calendar/calendar.module';
import {
  Content,
  ContentRepository,
} from '../../models/content/content.entity';
import { ContentModule } from '../../models/content/content.module';
import { InsightsModule } from '../../providers/insights/insights.module';
import { Job, JobRepository } from '../../models/job/job.entity';
import { NotionModule } from '../../providers/notion/notion.module';
import { OAuth, OAuthRepository } from '../../entities/oauth.entity';
import { AuthModule } from '../../auth/auth.module';
import {
  Schedule,
  ScheduleRepository,
} from '../../models/schedule/schedule.entity';

@Module({
  imports: [
    AccountModule,
    AuthModule,
    CalendarModule,
    ContentModule,
    InsightsModule,
    NotionModule,
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
        entities: [Account, Content, Availability, Job, Schedule, OAuth],
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      AccountRepository,
      ContentRepository,
      AvailabilityRepository,
      JobRepository,
      OAuthRepository,
      ScheduleRepository,
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, AllExceptionsFilter],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}

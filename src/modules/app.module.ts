import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { AccountModule } from './account.module';
import { InisghtsModule } from './insights.module';
import { NotionModule } from './notion.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Account, AccountRepository } from '../entities/account.entity';
import { ContentModule } from './content.module';
import { AllExceptionsFilter } from '../shared/exceptions';
import { AuthModule } from '../auth/auth.module';
import { Content, ContentRepository } from '../entities/content.entity';
import {
  Availability,
  AvailabilityRepository,
} from '../entities/availability.entity';
import { Job, JobRepository } from '../entities/job.entity';
import { Schedule, ScheduleRepository } from '../entities/schedule.entity';

@Module({
  imports: [
    ContentModule,
    AccountModule,
    InisghtsModule,
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

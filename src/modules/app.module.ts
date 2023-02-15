import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { UserModule } from './user.module';
import { InisghtsModule } from './insights.module';
import { NotionModule } from './notion.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { ContentModule } from './content.module';
import { AllExceptionsFilter } from '../shared/exceptions';
import PocketBase from 'pocketbase';

@Module({
  imports: [
    ContentModule,
    UserModule,
    InisghtsModule,
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
        entities: [User],
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: AllExceptionsFilter, useClass: AllExceptionsFilter },
    {
      provide: 'POCKET_BASE',
      useFactory: () => {
        return new PocketBase('http://127.0.0.1:8090');
      },
    },
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}

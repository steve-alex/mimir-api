import { Module } from '@nestjs/common';
import { UserController } from '../controllers/user.controler';
import { UserService } from '../services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [TypeOrmModule],
})
export class UserModule {}

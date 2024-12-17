import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentifyController } from './identify.controller';
import { IdentifyService } from './identify.service';
import { Contact } from './contact.entity';

@Module({
  imports: [TypeOrmModule.forRoot(), TypeOrmModule.forFeature([Contact])],
  controllers: [IdentifyController],
  providers: [IdentifyService],
})
export class AppModule {}

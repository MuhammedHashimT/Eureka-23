import { Module } from '@nestjs/common';
import { PositionService } from './position.service';
import { PositionResolver } from './position.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Position } from './entities/position.entity';
import { CredentialsModule } from 'src/credentials/credentials.module';

@Module({
  imports:[TypeOrmModule.forFeature([Position]) , CredentialsModule],
  providers: [PositionResolver, PositionService],
  exports:[PositionService]
})
export class PositionModule {}

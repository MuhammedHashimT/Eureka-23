import { Module } from '@nestjs/common';
import { DetailsService } from './details.service';
import { DetailsResolver } from './details.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Detail } from './entities/detail.entity';
import { CredentialsModule } from 'src/credentials/credentials.module';

@Module({
  imports:[TypeOrmModule.forFeature([Detail]) , CredentialsModule],
  providers: [DetailsResolver, DetailsService],
  exports: [DetailsService ],
})
export class DetailsModule {}

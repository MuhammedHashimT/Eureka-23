import { Module } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { FeedsResolver } from './feeds.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feed } from './entities/feed.entity';
import { CredentialsModule } from 'src/credentials/credentials.module';

@Module({
  imports: [TypeOrmModule.forFeature([Feed]),CredentialsModule],
  providers: [FeedsResolver, FeedsService]
})
export class FeedsModule {}

import { Module, forwardRef } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { SectionsResolver } from './sections.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Section } from './entities/section.entity';
import { CredentialsModule } from 'src/credentials/credentials.module';

@Module({
  imports: [TypeOrmModule.forFeature([Section]), forwardRef(() => CredentialsModule)],
  providers: [SectionsResolver, SectionsService],
  exports: [SectionsService],
})
export class SectionsModule {}

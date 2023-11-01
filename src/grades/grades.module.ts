import { Module } from '@nestjs/common';
import { GradesService } from './grades.service';
import { GradesResolver } from './grades.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from './entities/grade.entity';
import { CredentialsModule } from 'src/credentials/credentials.module';

@Module({
  imports:[TypeOrmModule.forFeature([Grade]) , CredentialsModule],
  providers: [GradesResolver, GradesService],
  exports:[GradesService]
})
export class GradesModule {}

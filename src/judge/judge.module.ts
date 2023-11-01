import { Module } from '@nestjs/common';
import { JudgeService } from './judge.service';
import { JudgeResolver } from './judge.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Judge } from './entities/judge.entity';
import { ProgrammesModule } from 'src/programmes/programmes.module';
import { CredentialsModule } from 'src/credentials/credentials.module';
import { CandidatesModule } from 'src/candidates/candidates.module';
import { CandidateProgrammeModule } from 'src/candidate-programme/candidate-programme.module';

@Module({
  imports: [TypeOrmModule.forFeature([Judge]) , ProgrammesModule , CredentialsModule , CandidatesModule , CandidateProgrammeModule],
  providers: [JudgeResolver, JudgeService]
})
export class JudgeModule {}

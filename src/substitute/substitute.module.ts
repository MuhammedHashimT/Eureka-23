import { Module } from '@nestjs/common';
import { SubstituteService } from './substitute.service';
import { SubstituteResolver } from './substitute.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Substitute } from './entities/substitute.entity';
import { ProgrammesModule } from 'src/programmes/programmes.module';
import { CandidatesModule } from 'src/candidates/candidates.module';
import { CandidateProgrammeModule } from 'src/candidate-programme/candidate-programme.module';
import { CredentialsModule } from 'src/credentials/credentials.module';
import { CategoryModule } from 'src/category/category.module';
import { TeamsModule } from 'src/teams/teams.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Substitute]),
    ProgrammesModule,
    CandidatesModule,
    CandidateProgrammeModule,
    CredentialsModule,
    CategoryModule,
    TeamsModule,
  ],
  providers: [SubstituteResolver, SubstituteService],
})
export class SubstituteModule {}

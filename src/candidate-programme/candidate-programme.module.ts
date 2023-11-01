import { Module, forwardRef } from '@nestjs/common';
import { CandidateProgrammeService } from './candidate-programme.service';
import { CandidateProgrammeResolver } from './candidate-programme.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateProgramme } from './entities/candidate-programme.entity';
import { CandidatesModule } from 'src/candidates/candidates.module';
import { ProgrammesModule } from 'src/programmes/programmes.module';
import { CategoryModule } from 'src/category/category.module';
import { GradesModule } from 'src/grades/grades.module';
import { PositionModule } from 'src/position/position.module';
import { ResultGenService } from './result-gen.service';
import { ResultGenResolver } from './result-gen.resolver';
import { CredentialsModule } from 'src/credentials/credentials.module';
import { DetailsModule } from 'src/details/details.module';
import { CategorySettingsModule } from 'src/category-settings/category-settings.module';
import { TeamsModule } from 'src/teams/teams.module';
import { CustomSettingsModule } from 'src/custom-settings/custom-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CandidateProgramme]),
    forwardRef(() => CandidatesModule),
    ProgrammesModule,
    CategoryModule,
    GradesModule,
    PositionModule,
    CredentialsModule,
    DetailsModule,
    CategorySettingsModule,
    TeamsModule,
    CustomSettingsModule
  ],
  providers: [
    CandidateProgrammeResolver,
    CandidateProgrammeService,
    ResultGenService,
    ResultGenResolver,
  ],
  exports: [CandidateProgrammeService , ResultGenService],
})
export class CandidateProgrammeModule {}

import { Module } from '@nestjs/common';
import { SkillService } from './skill.service';
import { SkillResolver } from './skill.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { CredentialsModule } from 'src/credentials/credentials.module';

@Module({
  imports: [TypeOrmModule.forFeature([Skill]), CredentialsModule],
  providers: [SkillResolver, SkillService],
  exports: [SkillService],
})
export class SkillModule {}

import { Resolver, Query, Mutation, Args, Int, Info } from '@nestjs/graphql';
import { SkillService } from './skill.service';
import { Skill } from './entities/skill.entity';
import { CreateSkillInput } from './dto/create-skill.input';
import { UpdateSkillInput } from './dto/update-skill.input';
import { AuthPipe } from './pipe/auth.pipe';
import { UseGuards, UsePipes } from '@nestjs/common';
import { HasRoles, RolesGuard } from 'src/credentials/roles/roles.guard';
import { Roles } from 'src/credentials/roles/roles.enum';
import { fieldsProjection } from 'graphql-fields-list';
import { CredentialsService } from 'src/credentials/credentials.service';

@Resolver(() => Skill)
export class SkillResolver {
  constructor(
    private readonly skillService: SkillService,
    private readonly credentialsService: CredentialsService,
  ) {}

  @UsePipes(AuthPipe)
  @Mutation(() => Skill)
  @HasRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  createSkill(@Args('createSkillInput') createSkillInput: CreateSkillInput) {
    return this.skillService.create(createSkillInput);
  }

  @Query(() => [Skill], { name: 'skills' })
  async findAll(@Info() info: any, @Args('api_key') api_key: string) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.skillService.findAll(fields);
  }

  @Query(() => Skill, { name: 'skill' })
  async findOne(
    @Args('id', { type: () => Int }) id: number,
    @Args('api_key') api_key: string,
    @Info() info: any,
  ) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.skillService.findOne(id, fields);
  }

  @Mutation(() => Skill)
  @HasRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  updateSkill(@Args('updateSkillInput') updateSkillInput: UpdateSkillInput) {
    return this.skillService.update(updateSkillInput.id, updateSkillInput);
  }

  @Mutation(() => Skill)
  @HasRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  removeSkill(@Args('id', { type: () => Int }) id: number) {
    return this.skillService.remove(id);
  }
}

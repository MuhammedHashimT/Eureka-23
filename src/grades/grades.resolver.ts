import { Resolver, Query, Mutation, Args, Int, Info } from '@nestjs/graphql';
import { GradesService } from './grades.service';
import { Grade } from './entities/grade.entity';
import { CreateGradeInput } from './dto/create-grade.input';
import { UpdateGradeInput } from './dto/update-grade.input';
import { AuthPipe } from './pipe/auth.pipe';
import { UseGuards, UsePipes } from '@nestjs/common';
import { HasRoles, RolesGuard } from 'src/credentials/roles/roles.guard';
import { Roles } from 'src/credentials/roles/roles.enum';
import { fieldsProjection } from 'graphql-fields-list';
import { CredentialsService } from 'src/credentials/credentials.service';

@Resolver(() => Grade)
export class GradesResolver {
  constructor(private readonly gradesService: GradesService,
    private readonly credentialsService: CredentialsService,) {}

  @UsePipes(AuthPipe)
  @HasRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @Mutation(() => Grade)
  createGrade(@Args('createGradeInput') createGradeInput: CreateGradeInput) {
    return this.gradesService.create(createGradeInput);
  }

  @Query(() => [Grade], { name: 'grades' })
  async findAll(
    @Info() info: any,
    @Args('api_key') api_key: string,
  ) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.gradesService.findAll( fields);
  }

  @Query(() => Grade, { name: 'grade' })
  async findOne(@Args('id', { type: () => Int }) id: number , @Args('api_key') api_key: string, @Info() info: any) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.gradesService.findOne(id , fields);
  }

  
  @Mutation(() => Grade)
  @HasRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  updateGrade(@Args('updateGradeInput') updateGradeInput: UpdateGradeInput) {
    return this.gradesService.update(updateGradeInput.id, updateGradeInput);
  }

  @Mutation(() => Grade)
  @HasRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  removeGrade(@Args('id', { type: () => Int }) id: number) {
    return this.gradesService.remove(id);
  }
}

import { Resolver, Query, Mutation, Args, Int, Context, Info } from '@nestjs/graphql';
import { JudgeService } from './judge.service';
import { Judge } from './entities/judge.entity';
import { CreateJudgeInput } from './dto/create-judge.input';
import { UpdateJudgeInput } from './dto/update-judge.input';
import { HasRoles, RolesGuard } from 'src/credentials/roles/roles.guard';
import { Roles } from 'src/credentials/roles/roles.enum';
import { UseGuards } from '@nestjs/common';
import { arrayInput } from 'src/candidate-programme/dto/array-input.dto';
import { fieldsProjection } from 'graphql-fields-list';
import { CredentialsService } from 'src/credentials/credentials.service';

@Resolver(() => Judge)
export class JudgeResolver {
  constructor(private readonly judgeService: JudgeService,
    private readonly credentialsService: CredentialsService,) {}

  @Mutation(() => Judge)
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  createJudge(
    @Args('createJudgeInput') createJudgeInput: CreateJudgeInput,
    @Context('req') req: any,
  ) {
    return this.judgeService.create(createJudgeInput, req.user);
  }

  @Query(() => [Judge], { name: 'judges' })
  async findAll(@Info() info: any, @Args('api_key') api_key: string,) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.judgeService.findAll(fields);
  }

  @Query(() => Judge, { name: 'judge' })
  async findOne(@Args('id', { type: () => Int }) id: number, @Args('api_key') api_key: string, @Info() info: any) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.judgeService.findOne(id, fields);
  }

  @Mutation(() => Judge)
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  updateJudge(
    @Args('updateJudgeInput') updateJudgeInput: UpdateJudgeInput,
    @Context('req') req: any,
  ) {
    return this.judgeService.update(updateJudgeInput.id, updateJudgeInput, req.user);
  }

  @Mutation(() => Judge)
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  removeJudge(@Args('id', { type: () => Int }) id: number, @Context('req') req: any) {
    return this.judgeService.remove(id);
  }

   @Mutation(() => Judge)
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  judgeLogin(@Args('username') username: string , @Args('password') password: string  ) {
    return this.judgeService.judgeLogin(username , password);
  }
  
  @Mutation(() => String)
  uploadMarkByJudge(
    @Args('programmeCode') programmeCode: string,
    @Args('jugdeId') JudgeId: number,
    @Args({ name: 'addResult', type: () => arrayInput })
    addResult: arrayInput,
  ) {
    return this.judgeService.uploadMarkByJudge(JudgeId, programmeCode, addResult);
  }
}

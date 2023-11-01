import { Resolver, Query, Mutation, Args, Int, Context, Info } from '@nestjs/graphql';
import { ProgrammesService } from './programmes.service';
import { Programme } from './entities/programme.entity';
import { CreateProgrammeInput } from './dto/create-programme.input';
import { UpdateProgrammeInput } from './dto/update-programme.input';
import { UseGuards } from '@nestjs/common';
import { CreateSchedule } from './dto/create-schedule.dto';
import { HasRoles, RolesGuard } from 'src/credentials/roles/roles.guard';
import { Roles } from 'src/credentials/roles/roles.enum';
import { ScheduleCreate } from './dto/scheduleCreate.dto';
import { createInput } from './dto/create-inputs.inputs';
import { fieldsProjection } from 'graphql-fields-list';
import { CredentialsService } from 'src/credentials/credentials.service';

@Resolver(() => Programme)
export class ProgrammesResolver {
  constructor(private readonly programmesService: ProgrammesService,
    private readonly credentialsService: CredentialsService,) {}

  // @UsePipes(AuthPipe)
  @Mutation(() => Programme)
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  createProgramme(
    @Args('createProgrammeInput') createProgrammeInput: CreateProgrammeInput,
    @Context('req') req: any,
  ) {
    return this.programmesService.create(createProgrammeInput, req.user);
  }

  @Mutation(() => [Programme])
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  createManyProgrammes(
    @Args('createProgrammeInput', { type: () => createInput })
    createProgrammeInput: createInput,
    @Context('req') req: any,
  ) {
    return this.programmesService.createMany(createProgrammeInput, req.user);
  }

  @Query(() => [Programme], { name: 'programmes' })
  async findAll(@Info() info: any,  @Args('api_key') api_key: string,) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.programmesService.findAll(fields);
  }

  @Query(() => Programme, { name: 'programme' })
  async findOne(@Args('id', { type: () => Int }) id: number, @Args('api_key') api_key: string, @Info() info: any) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.programmesService.findOne(id, fields);
  }

  @Query(() => Programme, { name: 'programmeByCode' })
  async findProgrammeByCode(@Args('code') code: string, @Args('api_key') api_key: string) {
    await this.credentialsService.ValidateApiKey(api_key);
    return this.programmesService.findOneByCode(code,);
  }


  @Query(() => [Programme], { name: 'resultEnteredProgrammes' })
  async resultEnteredProgrammes(@Info() info: any, @Args('api_key') api_key: string,) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.programmesService.findResultEnteredProgrammes(fields);
  }

  @Query(() => [Programme], { name: 'resultPublishedProgrammes' })
  async resultPublishedProgrammes(@Info() info: any, @Args('api_key') api_key: string,) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.programmesService.findResultPublishedProgrammes(fields);
  }

  @Query(() => [Programme], { name: 'programmesByCategory' })
  findAllByCategory(
    @Args('categoriesName', { type: () => [String] }) categoriesName: string[],
    @Info() info: any
  ) {
    const fields = Object.keys(fieldsProjection(info));
    return this.programmesService.findByCategories(categoriesName , fields);
  }


  @Mutation(() => Programme)
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  updateProgramme(
    @Args('updateProgrammeInput') updateProgrammeInput: UpdateProgrammeInput,
    @Context('req') req: any,
  ) {
    return this.programmesService.update(updateProgrammeInput.id, updateProgrammeInput, req.user);
  }

  @Mutation(() => Programme)
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  removeProgramme(@Args('id', { type: () => Int }) id: number, @Context('req') req: any) {
    return this.programmesService.remove(id, req.user);
  }

  @Mutation(() => Programme)
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  setSchedule(
    @Args('createScheduleInput') createSchedule: CreateSchedule,
    @Context('req') req: any,
  ) {
    return this.programmesService.setSchedule(createSchedule, req.user);
  }

  @Mutation(() => [Programme])
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  setManySchedule(
    @Args('createScheduleInput', { type: () => ScheduleCreate }) createSchedule: ScheduleCreate,
    @Context('req') req: any,
  ) {
    return this.programmesService.setManySchedule(createSchedule, req.user);
  }

  @Mutation(() => Programme)
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  removeSchedule(@Args('code', { type: () => Int }) code: string, @Context('req') req: any) {
    return this.programmesService.removeSchedule(code, req.user);
  }

  @Mutation(() => Programme)
  setAnyIssue(@Args('code') code: string, @Args('issue') issue: boolean) {
    return this.programmesService.setAnyIssue(code, issue);
  }
}

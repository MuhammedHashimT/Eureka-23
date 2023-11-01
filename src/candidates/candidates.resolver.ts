import { Resolver, Query, Mutation, Args, Int, Context, Info } from '@nestjs/graphql';
import { CandidatesService } from './candidates.service';
import { Candidate } from './entities/candidate.entity';
import { CreateCandidateInput } from './dto/create-candidate.input';
import { UpdateCandidateInput } from './dto/update-candidate.input';
import { UseGuards } from '@nestjs/common';
import { HasRoles, RolesGuard } from 'src/credentials/roles/roles.guard';
import { Roles } from 'src/credentials/roles/roles.enum';
import { CreateInput } from './dto/create-input.dto';
import { fieldsProjection } from 'graphql-fields-list';
import { CredentialsService } from 'src/credentials/credentials.service';
import { Category } from 'src/category/entities/category.entity';

@Resolver(() => Candidate)
export class CandidatesResolver {
  constructor(private readonly candidatesService: CandidatesService,
    private readonly credentialsService: CredentialsService) { }

  // @UsePipes(CandidatePipe)
  @Mutation(() => Candidate)
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  createCandidate(
    @Args('createCandidateInput') createCandidateInput: CreateCandidateInput,
    @Context('req') req: any,
  ) {
    return this.candidatesService.create(createCandidateInput, req.user);
  }

  @Mutation(() => [Candidate])
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  createManyCandidates(
    @Args('createCandidateInput', { type: () => CreateInput })
    createCandidateInput: CreateInput,
    @Context('req') req: any,
  ) {
    return this.candidatesService.createMany(createCandidateInput, req.user);
  }

  @Query(() => [Candidate], { name: 'candidates' })
  async findAll(
    @Info() info: any,
    @Args('api_key') api_key: string,
  ) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.candidatesService.findAll(fields);
  }

  @Query(() => Candidate, { name: 'candidateByChestNo' })
  async findCandidateByChestNo(
    @Args('chestNo') chestNo: string,
    @Args('api_key') api_key: string
  ) {
    await this.credentialsService.ValidateApiKey(api_key);
    return this.candidatesService.findOneByChestNo(chestNo);
  }

  // @Query(() => [Candidate], { name: 'candidatesByCategory' })
  // findAllByCategory(
  //   @Args('categoriesName', { type: () => [String] }) categoriesName: string[],
  //   @Info() info: any
  // ) {
  //   const fields = Object.keys(fieldsProjection(info));
  //   return this.candidatesService.findByCategories(categoriesName, fields);
  // }

  @Query(() => [Candidate], { name: 'candidatesByCategoriesAndTeam' })
  findAllByCategoriesAndTeam(
    @Args('categoriesName', { type: () => [String] }) categoriesName: string[],
    @Args('teamName', { type: () => String }) teamName: string,
    @Info() info: any
  ) {
    const fields = Object.keys(fieldsProjection(info));
    return this.candidatesService.findByCategoryNamesAndTeamName(categoriesName, teamName, fields);
  }

  @Query(() => [Category], { name: 'getCategoryBasedToppers' })
  getCategoryBasedToppers(){
    return this.candidatesService.getCategoryBasedToppers();
  }

  @Query(() => [Category], { name: 'getPublishedCategoryBasedToppers' })
  getPublishedCategoryBasedToppers(){
    return this.candidatesService.getPublishedCategoryBasedToppers();
  }

  @Query(() => Candidate, { name: 'candidate' })
  async findOne(@Args('id', { type: () => Int }) id: number, @Args('api_key') api_key: string, @Info() info: any) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.candidatesService.findOne(id, fields);
  }

  @Query(() => [Candidate], { name: 'findOverallToppers' })
  async findOverallToppers(@Args('api_key') api_key: string, @Info() info: any) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    // return this.candidatesService.findOverallToppers(fields);
  }


  @Mutation(() => Candidate)
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  updateCandidate(
    @Args('updateCandidateInput') updateCandidateInput: UpdateCandidateInput,
    @Context('req') req: any,
  ) {
    return this.candidatesService.update(updateCandidateInput.id, updateCandidateInput, req.user);
  }

  @Mutation(() => Candidate)
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  removeCandidate(@Args('id', { type: () => Int }) id: number, @Context('req') req: any) {
    return this.candidatesService.remove(id, req.user);
  }
}

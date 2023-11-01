import { Resolver, Query, Mutation, Args, Int, Info, Context } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { UseGuards, UsePipes } from '@nestjs/common';
import { CategoryPipe } from './pipe/category.pipe';
import { HasRoles, RolesGuard } from 'src/credentials/roles/roles.guard';
import { Roles } from 'src/credentials/roles/roles.enum';
import { fieldsProjection } from 'graphql-fields-list';
import { CredentialsService } from 'src/credentials/credentials.service';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService,
    private readonly credentialsService: CredentialsService) { }

  @UsePipes(CategoryPipe)
  @Mutation(() => Category)
  @HasRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  createCategory(@Args('createCategoryInput') createCategoryInput: CreateCategoryInput) {
    return this.categoryService.create(createCategoryInput);
  }

  @Query(() => [Category], { name: 'categories' })
  async findAll(
    @Info() info: any,
    @Args('api_key') api_key: string,
  ) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.categoryService.findAll(  fields);
  }

  @Query(() => Category, { name: 'category' })
  async findOne(@Args('id', { type: () => Int }) id: number , @Args('api_key') api_key: string, @Info() info: any) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.categoryService.findOne(id , fields);
  }

  @HasRoles(Roles.Controller , Roles.TeamManager)
  @UseGuards(RolesGuard)
  @Query(() => [Category], { name: 'categoriesByNames' })
  async findByName( @Info() info: any , @Args('api_key') api_key: string, @Context('req') request: any) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    const names = request.user.categories.map((category : Category) => category.name);
    const team = request.user.team.name;
    return this.categoryService.findManyByName(names , fields , team );
  }


  @UsePipes(CategoryPipe)
  @Mutation(() => Category)
  @HasRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  updateCategory(@Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput) {
    return this.categoryService.update(updateCategoryInput.id, updateCategoryInput);
  }

  @Mutation(() => Category)
  @HasRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  removeCategory(@Args('id', { type: () => Int }) id: number) {
    return this.categoryService.remove(id);
  }
}

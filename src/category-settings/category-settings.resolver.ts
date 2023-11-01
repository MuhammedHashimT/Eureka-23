import { Resolver, Query, Mutation, Args, Int, Context, Info } from '@nestjs/graphql';
import { CategorySettingsService } from './category-settings.service';
import { CategorySettings } from './entities/category-setting.entity';
import { CreateCategorySettingInput } from './dto/create-category-setting.input';
import { UpdateCategorySettingInput } from './dto/update-category-setting.input';
import { CategorySettingsModule } from './category-settings.module';
import { HasRoles, RolesGuard } from 'src/credentials/roles/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/credentials/roles/roles.enum';
import { fieldsProjection } from 'graphql-fields-list';
import { CredentialsService } from 'src/credentials/credentials.service';

@Resolver(() => CategorySettingsModule)
export class CategorySettingsResolver {
  constructor(private readonly categorySettingsService: CategorySettingsService,
    private readonly credentialsService: CredentialsService,) {}

  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  @Mutation(() => CategorySettings)
  createCategorySetting(
    @Args('createCategorySettingInput') createCategorySettingInput: CreateCategorySettingInput,
    @Context('req') req: any,
  ) {
    return this.categorySettingsService.create(createCategorySettingInput, req.user);
  }

  @Query(() => [CategorySettings], { name: 'categorySettings' })
  async findAll(@Info() info: any, @Args('api_key') api_key: string,) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.categorySettingsService.findAll(fields);
  }

  @Query(() => CategorySettings, { name: 'categorySetting' })
  async findOne(@Args('id', { type: () => Int }) id: number, @Args('api_key') api_key: string, @Info() info: any) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.categorySettingsService.findOne(id, fields);
  }

  @Mutation(() => CategorySettings)
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  updateCategorySetting(
    @Args('updateCategorySettingInput') updateCategorySettingInput: UpdateCategorySettingInput,
    @Context('req') req: any,
  ) {
    return this.categorySettingsService.update(
      updateCategorySettingInput.id,
      updateCategorySettingInput,
      req.user,
    );
  }

  @Mutation(() => CategorySettings)
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  removeCategorySetting(@Args('id', { type: () => Int }) id: number, @Context('req') req: any) {
    return this.categorySettingsService.remove(id, req.user);
  }

  @Mutation(() => CategorySettings)
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  changeProgrammeListUpdatable(
    @Args('name') name: string,
    @Context('req') req: any,
  ) {
    return this.categorySettingsService.updateStatus(name, req.user);
  }
}

import { Resolver, Query, Mutation, Args, Int, Context, Info } from '@nestjs/graphql';
import { SectionsService } from './sections.service';
import { Section } from './entities/section.entity';
import { CreateSectionInput } from './dto/create-section.input';
import { UpdateSectionInput } from './dto/update-section.input';
import { UseGuards, UsePipes } from '@nestjs/common';
import { AuthPipe } from './pipe/auth.pipe';
import { HasRoles, RolesGuard } from 'src/credentials/roles/roles.guard';
import { Roles } from 'src/credentials/roles/roles.enum';
import { fieldsProjection } from 'graphql-fields-list';
import { CredentialsService } from 'src/credentials/credentials.service';

@Resolver(() => Section)
export class SectionsResolver {
  constructor(private readonly sectionsService: SectionsService,
    private readonly credentialsService: CredentialsService,) {}

  @Mutation(() => Section)
  @UsePipes(AuthPipe)
  @HasRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  createSection(@Args('createSectionInput') createSectionInput: CreateSectionInput) {
    return this.sectionsService.create(createSectionInput);
  }

  @Query(() => [Section], { name: 'sections' })
  async findAll(@Info() info: any, @Args('api_key') api_key: string,) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.sectionsService.findAll(fields);
  }

  @Query(() => Section, { name: 'section' })
  async findOne(@Args('id', { type: () => Int }) id: number, @Args('api_key') api_key: string, @Info() info: any) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.sectionsService.findOne(id, fields);
  }

  @Mutation(() => Section)
  @HasRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  updateSection(@Args('updateSectionInput') updateSectionInput: UpdateSectionInput) {
    return this.sectionsService.update(updateSectionInput.id, updateSectionInput);
  }

  @Mutation(() => Section)
  @HasRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  removeSection(@Args('id', { type: () => Int }) id: number) {
    return this.sectionsService.remove(id);
  }
}

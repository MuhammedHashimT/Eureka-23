import { Resolver, Query, Mutation, Args, Int, Context, Info } from '@nestjs/graphql';
import { CredentialsService } from './credentials.service';
import { Credential } from './entities/credential.entity';
import { CreateCredentialInput } from './dto/create-credential.input';
import { UpdateCredentialInput } from './dto/update-credential.input';
import { HasRoles, RolesGuard } from './roles/roles.guard';
import { Roles } from './roles/roles.enum';
import { UseGuards } from '@nestjs/common';
import { fieldsProjection } from 'graphql-fields-list';

@Resolver(() => Credential)
export class CredentialsResolver {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Mutation(() => Credential)
  // @UsePipes(AuthPipe)
  @HasRoles(Roles.Controller, Roles.Admin, Roles.TeamManager)
  @UseGuards(RolesGuard)
  createCredential(
    @Args('createCredentialInput') createCredentialInput: CreateCredentialInput,
    @Context('req') req: any,
  ) {
    return this.credentialsService.create(createCredentialInput, req.user);
  }

  @HasRoles(Roles.Controller, Roles.Admin, Roles.TeamManager)
  @UseGuards(RolesGuard)
  @Query(() => [Credential], { name: 'credentials' })
  findAll(@Info() info: any) {
    const fields = Object.keys(fieldsProjection(info));
    return this.credentialsService.findAll(fields);
  }


  @Query(() => [Credential], { name: 'credentialsByTeam' })
  async findAllByTeam(@Args('team', { type: () => String }) team: string, @Args('api_key') api_key: string,) {
    await this.credentialsService.ValidateApiKey(api_key);
    return this.credentialsService.findByTeam(team);
  }

  @Query(() => [Credential], { name: 'credentialsByRole' })
  async findAllByRole(@Args('role', { type: () => Roles }) role: Roles, @Args('api_key') api_key: string,) {
    await this.credentialsService.ValidateApiKey(api_key);
    return this.credentialsService.findByRole(role);
  }

  @HasRoles(Roles.Controller, Roles.Admin, Roles.TeamManager)
  @UseGuards(RolesGuard)
  @Query(() => Credential, { name: 'credential' })
  findOne(@Args('id', { type: () => Int }) id: number, @Info() info: any) {
    const fields = Object.keys(fieldsProjection(info));
    return this.credentialsService.findOne(id, fields);
  }

  @Mutation(() => Credential)
  @HasRoles(Roles.Controller, Roles.Admin, Roles.TeamManager)
  @UseGuards(RolesGuard)
  updateCredential(
    @Args('updateCredentialInput') updateCredentialInput: UpdateCredentialInput,
    @Context('req') request: any,
  ) {
    return this.credentialsService.update(updateCredentialInput, request.user);
  }

  @Mutation(() => Credential)
  @HasRoles(Roles.Controller, Roles.Admin, Roles.TeamManager)
  @UseGuards(RolesGuard)
  removeCredential(@Args('id', { type: () => Int }) id: number, @Context('req') request: any) {
    return this.credentialsService.remove(id, request.user);
  }

  @UseGuards(RolesGuard)
  @Query(() => Credential)
  checkLoggedIn(@Context('req') request: any) {
    return this.credentialsService.checkLoggedIn(request);
  }
}

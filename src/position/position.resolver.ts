import { Resolver, Query, Mutation, Args, Int, Info } from '@nestjs/graphql';
import { PositionService } from './position.service';
import { Position } from './entities/position.entity';
import { CreatePositionInput } from './dto/create-position.input';
import { UpdatePositionInput } from './dto/update-position.input';
import { AuthPipe } from './pipe/auth.pipe';
import { UseGuards, UsePipes } from '@nestjs/common';
import { HasRoles, RolesGuard } from 'src/credentials/roles/roles.guard';
import { Roles } from 'src/credentials/roles/roles.enum';
import { fieldsProjection } from 'graphql-fields-list';
import { CredentialsService } from 'src/credentials/credentials.service';

@Resolver(() => Position)
export class PositionResolver {
  constructor(private readonly positionService: PositionService,
    private readonly credentialsService: CredentialsService,) {}

  @UsePipes(AuthPipe)
  @HasRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @Mutation(() => Position)
  createPosition(@Args('createPositionInput') createPositionInput: CreatePositionInput) {
    return this.positionService.create(createPositionInput);
  }

  @Query(() => [Position], { name: 'positions' })
  async findAll(
    @Info() info: any,
    @Args('api_key') api_key: string,
  ) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.positionService.findAll( fields);
  }

  @Query(() => Position, { name: 'position' })
  async findOne(@Args('id', { type: () => Int }) id: number , @Args('api_key') api_key: string, @Info() info: any) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.positionService.findOne(id , fields);
  }

  @HasRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @Mutation(() => Position)
  updatePosition(@Args('updatePositionInput') updatePositionInput: UpdatePositionInput) {
    return this.positionService.update(updatePositionInput.id, updatePositionInput);
  }

  @Mutation(() => Position)
  @HasRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  removePosition(@Args('id', { type: () => Int }) id: number) {
    return this.positionService.remove(id);
  }
}

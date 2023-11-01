import { InputType, Int, Field } from '@nestjs/graphql';
import { Category } from 'src/category/entities/category.entity';
import { Team } from 'src/teams/entities/team.entity';
import { Roles } from '../roles/roles.enum';

@InputType()
export class CreateCredentialInput {
  
  @Field()
  username: string;

  @Field()
  password: string;

  @Field(()=> Roles)
  roles: Roles;

  @Field(() => [String] , { nullable: true })
  categories?: string[];

  @Field( { nullable: true })
  team?: string;
}



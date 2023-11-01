import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateTeamInput {
  @IsNotEmpty()
  @Field()
  name:string;

  @IsNotEmpty()
  @Field()
  shortName: string;

  @Field({nullable:true})
  description: string;

  @Field({nullable:true})
  color : string
}

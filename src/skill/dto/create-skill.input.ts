import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateSkillInput {
  @Field()
  @IsNotEmpty()
  name:string;

  @Field()
  @IsNotEmpty()
  description:string;

  @Field()
  @IsNotEmpty()
  shortName:string;
}

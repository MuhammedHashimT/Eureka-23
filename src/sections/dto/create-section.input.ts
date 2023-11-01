import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateSectionInput {

  @Field()
  @IsNotEmpty()
  name:string;

}

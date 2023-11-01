import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateCategoryInput {
  
  @Field()
  @IsNotEmpty()
  name: string;


  @Field()
  section : string;
}

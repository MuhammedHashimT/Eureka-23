import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateJudgeInput {
 
  @Field()
  @IsNotEmpty()
  username : string;

  @Field()
  @IsNotEmpty()
  password : string;

  @Field()
  @IsNotEmpty()
  judgeName : string;

  @Field()
  @IsNotEmpty()
  programmeCode : string ;

}

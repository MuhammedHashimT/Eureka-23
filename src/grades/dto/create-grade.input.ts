import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

@InputType()
export class CreateGradeInput {
  @IsNotEmpty()
  @Field()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Field(()=> Int)
  percentage : number;

  @IsNotEmpty()
  @IsNumber()
  @Field(()=> Int)
  pointGroup : number;

  @IsNotEmpty()
  @IsNumber()
  @Field(()=> Int)
  pointSingle : number;

  @IsNotEmpty()
  @IsNumber()
  @Field(()=> Int)
  pointHouse : number; 
}

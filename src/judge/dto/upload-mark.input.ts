import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class UploadMarkInput {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  chestNo: number

  @Field(() => Float)
  @IsNotEmpty()
  mark: number
}



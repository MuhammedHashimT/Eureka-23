import { InputType, Field } from '@nestjs/graphql';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProgrammeInput } from './create-programme.input';

@InputType()
export class createInput {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProgrammeInput)
  @Field(() => [CreateProgrammeInput])
  inputs: CreateProgrammeInput[];
}

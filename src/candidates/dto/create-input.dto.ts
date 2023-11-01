import { InputType, Field } from '@nestjs/graphql';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCandidateInput } from './create-candidate.input';

@InputType()
export class CreateInput {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCandidateInput)
  @Field(() => [CreateCandidateInput])
  inputs: CreateCandidateInput[];
}

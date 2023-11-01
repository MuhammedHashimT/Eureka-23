import { InputType, Field } from '@nestjs/graphql';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateCandidateInput } from './update-candidate.input';

@InputType()
export class UpdateInput {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCandidateInput)
  @Field(() => [UpdateCandidateInput])
  inputs: UpdateCandidateInput[];
}

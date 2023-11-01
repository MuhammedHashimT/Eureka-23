import { InputType, Field } from '@nestjs/graphql';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';;
import { UpdateCandidateInput } from 'src/candidates/dto/update-candidate.input';

@InputType()
export class updateInput {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCandidateInput)
  @Field(() => [UpdateCandidateInput])
  inputs: UpdateCandidateInput[];
}

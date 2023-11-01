import { CreateCandidateProgrammeInput } from './create-candidate-programme.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCandidateProgrammeInput extends PartialType(CreateCandidateProgrammeInput) {
  @Field(() => Int)
  id: number;
}

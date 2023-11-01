import { CreateProgrammeInput } from './create-programme.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateProgrammeInput extends PartialType(CreateProgrammeInput) {
  @Field(() => Int)
  id: number;
}

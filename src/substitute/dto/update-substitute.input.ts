import { CreateSubstituteInput } from './create-substitute.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateSubstituteInput extends PartialType(CreateSubstituteInput) {
  @Field(() => Int)
  id: number;
}

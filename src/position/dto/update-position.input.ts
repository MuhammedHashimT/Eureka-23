import { CreatePositionInput } from './create-position.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdatePositionInput extends PartialType(CreatePositionInput) {
  @Field(() => Int)
  id: number;
}

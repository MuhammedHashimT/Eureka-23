import { CreateDetailInput } from './create-detail.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateDetailInput extends PartialType(CreateDetailInput) {
  @Field(() => Int)
  id: number;
}

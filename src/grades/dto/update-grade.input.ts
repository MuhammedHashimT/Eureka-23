import { CreateGradeInput } from './create-grade.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateGradeInput extends PartialType(CreateGradeInput) {
  @Field(() => Int)
  id: number;
}

import { CreateJudgeInput } from './create-judge.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateJudgeInput extends PartialType(CreateJudgeInput) {
  @Field(() => Int)
  id: number;
}

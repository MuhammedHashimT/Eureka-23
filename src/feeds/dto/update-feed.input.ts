import { CreateFeedInput } from './create-feed.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateFeedInput extends PartialType(CreateFeedInput) {
  @Field(() => Int)
  id: number;
}

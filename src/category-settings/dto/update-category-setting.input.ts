import { CreateCategorySettingInput } from './create-category-setting.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCategorySettingInput extends PartialType(CreateCategorySettingInput) {
  @Field(() => Int)
  id: number;
}

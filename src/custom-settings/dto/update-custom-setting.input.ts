import { CreateCustomSettingInput } from './create-custom-setting.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCustomSettingInput extends PartialType(CreateCustomSettingInput) {
  @Field(() => Int)
  id: number;
}

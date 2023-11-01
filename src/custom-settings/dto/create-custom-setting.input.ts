import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateCustomSettingInput {
  
  @Field()
  name: string;

  @Field(() => [String])
  programs: [string];

  @Field()
  category : string;

 @Field(() => Int)
  max : number;

 @Field(() => Int)
  min : number;
}

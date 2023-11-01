import { CreateCredentialInput } from './create-credential.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCredentialInput extends PartialType(CreateCredentialInput) {
  @Field(() => Int)
  id: number;
}

import { Field, ObjectType } from "@nestjs/graphql";
import { Credential } from "../entities/credential.entity";


@ObjectType()
export class LoginType {
  @Field(() => Credential)
  admin: Credential;

    @Field()
  token:string;
}

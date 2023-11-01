import { InputType, Int, Field } from '@nestjs/graphql';
import { Language } from '../entities/feed.entity';

@InputType()
export class CreateFeedInput {
  @Field(() => String )
  name : string

  @Field(() => Language )
  language : Language

  @Field(() => String )
  content:string; 
}

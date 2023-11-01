import { Field, ObjectType } from '@nestjs/graphql';
import { CandidateProgramme } from '../entities/candidate-programme.entity';

@ObjectType()
export class ObjectManyCandidateProgramme {
  @Field(() => [CandidateProgramme])
  result: CandidateProgramme[];

  @Field(() => [String], { nullable: true })
  errors: string[];
}

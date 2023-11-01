import { InputType,Field } from '@nestjs/graphql'
import { IsArray, ValidateNested , } from 'class-validator'
import { Type } from 'class-transformer';
import { CreateCandidateProgrammeInput } from './create-candidate-programme.input';

@InputType()
export class CreateManyCP {
   
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCandidateProgrammeInput)
  @Field(() => [CreateCandidateProgrammeInput])
  inputs : CreateCandidateProgrammeInput[] ;
}
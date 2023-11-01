import { InputType,Field } from '@nestjs/graphql'
import { IsArray, ValidateNested , } from 'class-validator'
import { AddResult } from './add-result.dto';
import { Type } from 'class-transformer';

@InputType()
export class arrayInput {
   
    @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddResult)
  @Field(() => [AddResult])
  inputs : AddResult[] ;
}

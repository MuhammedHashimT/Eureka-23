import { InputType, Field } from '@nestjs/graphql'
import { IsArray, ValidateNested, } from 'class-validator'
import { Type } from 'class-transformer';
import { AddManual } from './add-manual.dto';

@InputType()
export class arrayManualInput {

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddManual)
  @Field(() => [AddManual])
  inputs: AddManual[];
}
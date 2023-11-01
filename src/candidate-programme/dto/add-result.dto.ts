import { InputType, Int, Field, Float } from '@nestjs/graphql'
import { Type } from 'class-transformer'
import { IsNotEmpty, Max, Min, ValidateNested , } from 'class-validator'
import { arrayInput } from './array-input.dto'
import { IsFourCharactersWithNumbers } from '../../utils/Validator'

@InputType()
export class AddResult {
  @Field()
  @IsNotEmpty()
  @IsFourCharactersWithNumbers({message:"chest number must be 4 characters and last 3 characters must be numbers"})
  chestNo: string

  @Field(() => Float , {nullable:true})
  @IsNotEmpty()
  @Min(0)
  @Max(10)
  mark: number
}

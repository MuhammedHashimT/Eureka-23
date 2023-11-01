import { InputType, Int, Field, Float } from '@nestjs/graphql'
import { Type } from 'class-transformer'
import { IsNotEmpty, Max, Min, ValidateNested, } from 'class-validator'
import { arrayInput } from './array-input.dto'
import { IsFourCharactersWithNumbers } from 'src/utils/Validator'

@InputType()
export class AddManual {
    @Field()
    @IsNotEmpty()
    @IsFourCharactersWithNumbers({ message: "chest number must be 4 characters and last 3 characters must be numbers" })
    chestNo: string

    //   grade: string
    @Field({ nullable: true })
    grade: string

    // position: string
    @Field({ nullable: true })
    position: string
}
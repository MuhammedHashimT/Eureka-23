import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { IsFourCharactersWithNumbers } from '../../utils/Validator';

@InputType()
export class CreateSubstituteInput {

  @IsNotEmpty()

    @Field()
    reason : string;
  
    @IsNotEmpty()
    @Field()
    programme : string  ;

    @IsNotEmpty()
    @Field()
    @IsFourCharactersWithNumbers({message:"chest number must be 4 characters and last 3 characters must be numbers"})
    oldCandidate : string;

    @IsNotEmpty()
    @Field( )
    @IsFourCharactersWithNumbers({message:"chest number must be 4 characters and last 3 characters must be numbers"})
    newCandidate : string;
}

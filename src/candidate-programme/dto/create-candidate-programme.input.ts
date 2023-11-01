import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty} from 'class-validator';
import { IsFourCharactersWithNumbers } from '../../utils/Validator';

@InputType()
export class CreateCandidateProgrammeInput {
  @Field()
  @IsNotEmpty()
  programme_code: string;

  @IsNotEmpty()
  @Field()
  @IsFourCharactersWithNumbers({message:"chest number must be 4 characters and last 3 characters must be numbers"})
  chestNo: string;

  @Field(()=>[String] , {nullable:true})
  candidatesOfGroup : string[] ;
}

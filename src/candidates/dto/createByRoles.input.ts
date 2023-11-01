import { InputType, Int, Field } from '@nestjs/graphql';
import { Gender } from '../entities/candidate.entity';
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { IsFourCharactersWithNumbers } from 'src/utils/Validator';

@InputType()
export class createByRolesInput {
  @IsNotEmpty()
  @Field()
  name: string;

  @IsInt()
  @Field({ nullable: true })
  class: string;

  @IsInt()
  @Field(() => Int,{ nullable: true })
  adno: number;

  @Field({ nullable: true })
  dob: string;

  @IsFourCharactersWithNumbers({message:"chest number must be 4 characters and last 3 characters must be numbers"})
  @Field({ nullable: true })
  chestNO: string;

  @IsEnum(Gender)
  @Field(() => Gender)
  gender: Gender;

  @Field({ nullable: true })
  team: string;


  @Field({ nullable: true })
  category: string;

  @Field({ nullable: true })
  categories: string[];
}

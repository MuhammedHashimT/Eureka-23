import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateCategorySettingInput {

  @Field()
  @IsNotEmpty()
  category: string;

  // MAX

  @Field(() => Int)
  @IsNotEmpty()
  maxProgram: number;

  @Field(() => Int)
  @IsNotEmpty()
  maxSingle: number;

  @Field(() => Int)
  @IsNotEmpty()
  maxGroup: number;


  @Field(() => Int , {nullable : true})
  maxStage: number;

  @Field(() => Int , {nullable : true})
  maxNonStage: number;

  @Field(() => Int , {nullable : true})
  maxOutDoor: number;

  // ON SPORTS

  @Field(() => Int , {nullable : true})
  maxSports: number;

  @Field(() => Int , {nullable : true})
  maxSportsSingle: number;

  @Field(() => Int , {nullable : true})
  maxSportsGroup : number;

  // MIN

  @Field(() => Int)
  @IsNotEmpty()
  minProgram: number;

  @Field(() => Int)
  @IsNotEmpty()
  minSingle: number;

  @Field(() => Int)
  @IsNotEmpty()
  minGroup: number;

    
  @Field(() => Int , {nullable : true})
  minStage: number;

  @Field(() => Int , {nullable : true})
  minNonStage: number;

  @Field(() => Int , {nullable : true})
  minOutDoor: number;

// ON SPORTS

  @Field(() => Int , {nullable : true})
  minSports: number;

  @Field(() => Int , {nullable : true})
  minSportsSingle: number;

  @Field(() => Int , {nullable : true})
  minSportsGroup : number;
  
}

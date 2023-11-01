import { InputType, Int, Field, registerEnumType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Model } from '../entities/programme.entity';

export enum Mode {
  STAGE = 'STAGE',
  NON_STAGE = 'NON_STAGE',
  OUTDOOR_STAGE = 'OUTDOOR_STAGE'
}

export enum Type {
  SINGLE = 'SINGLE',
  GROUP = 'GROUP',
  HOUSE = 'HOUSE'
}


registerEnumType(Mode, {
  name: 'Mode',
});

registerEnumType(Type, {
  name: 'Type',
});

registerEnumType(Model, {
  name: 'Model',
});

@InputType()
export class CreateProgrammeInput {

  @IsNotEmpty()
  @Field()
  programCode: string;

  @IsNotEmpty()
  @Field()
  name: string;

  @IsNotEmpty()
  @Field(()=> Mode)
  mode: Mode;

  @IsNotEmpty()
  @Field(()=> Type)
  type: Type;

  @IsNotEmpty()
  @Field(()=> Model) 
  model: Model;
  
  @Field(()=> Int , {nullable:true})
  groupCount: number;

  @IsNotEmpty()
  @IsNumber()
  @Field(()=> Int )
  candidateCount: number;

  @Field({nullable:true})                                                                                           
  date: string;

  
  @Field(()=> Int ,{nullable:true} )
  venue: number;

  @IsNotEmpty()
  @IsNumber()
  @Field(()=> Int)
  duration: number;

  @IsNotEmpty()
  @Field()
  conceptNote: string;
                                             
  @Field()
  skill: string ;

  @IsNotEmpty()
  @Field()
  category : string;
}

import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Language {
  MALAYALAM = 'MALAYALAM',
  ENGLISH = 'ENGLISH',
  ARABIC = 'ARABIC',
  HINDI = 'HINDI',
  URDU = 'URDU',
  TAMIL = 'TAMIL',
  KANNADA = 'KANNADA',
  TELUGU = 'TELUGU',
  BENGALI = 'BENGALI',
  SPANISH = 'SPANISH',
  FRENCH = 'FRENCH',
}

registerEnumType(Language, {
  name: 'Language',
});

@ObjectType()
@Entity()
export class Feed {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String )
  @Column()
  name : string

  @Field(() => Language )
  @Column({
    type: 'enum',
    enum: Language,
    default: Language.MALAYALAM,
  })
  language : Language

  @Field(() => String )
  @Column()
  content:string; 

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;
}

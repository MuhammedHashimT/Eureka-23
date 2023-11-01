import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Programme } from 'src/programmes/entities/programme.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Skill {
  // Primary generated ID
  @Field(() => Int, { description: '', nullable: true })
  @PrimaryGeneratedColumn()
  id: number;

  // Normal columns

  @Column({ unique: true })
  @Field({ nullable: true })
  name: string;

  @Column({ unique: true })
  @Field({ nullable: true })
  shortName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description: string;

  // OneToMany relations

  @OneToMany(() => Programme, programme => programme.skill)
  @Field(() => [Programme], { nullable: true })
  programmes: Programme[];

  // Dates

  @CreateDateColumn()
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date, { nullable: true })
  updatedAt: Date;
}

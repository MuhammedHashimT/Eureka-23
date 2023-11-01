import { ObjectType, Field, Int } from '@nestjs/graphql';
import { CandidateProgramme } from 'src/candidate-programme/entities/candidate-programme.entity';
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
export class Position {
  // Primary generated ID

  @Field(() => Int, { description: '', nullable: true })
  @PrimaryGeneratedColumn()
  id: number;

  // Normal columns
  @Column({ unique: true })
  @Field({ nullable: true })
  name: string;

  @Column({ unique: true })
  @Field(() => Int, { nullable: true })
  value: number;

  @Column()
  @Field(() => Int, { nullable: true })
  pointGroup: number;

  @Column()
  @Field(() => Int, { nullable: true })
  pointSingle: number;

  @Column()
  @Field(() => Int, { nullable: true })
  pointHouse: number;

  // OneToMany relations

  @Field(() => [CandidateProgramme], { nullable: true })
  @OneToMany(() => CandidateProgramme, candidateProgramme => candidateProgramme.position)
  candidateProgramme: CandidateProgramme[];
  
  // Dates

  @CreateDateColumn()
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date, { nullable: true })
  updatedAt: Date;
}

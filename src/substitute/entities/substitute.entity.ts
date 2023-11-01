import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Candidate } from 'src/candidates/entities/candidate.entity';
import { Programme } from 'src/programmes/entities/programme.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Substitute {
  // Primary Generated columns

  @Field(() => Int, { description: '', nullable: true })
  @PrimaryGeneratedColumn()
  id: number;

  // Normal Columns

  @Column()
  @Field({ nullable: true })
  reason: string;

  @Column({ default: false })
  @Field(() => Boolean, { nullable: true })
  isAccepted: boolean;

  @Column({ default: false })
  @Field(() => Boolean, { nullable: true })
  isRejected: boolean;

  // OneTOMany relations

  @ManyToOne(() => Programme, programme => programme.substitutes, { nullable: true })
  @Field(() => Programme, { nullable: true })
  programme: Programme;

  @ManyToOne(() => Candidate, candidate => candidate.substitutesOld, { nullable: true })
  @Field(() => Candidate, { nullable: true })
  oldCandidate: Candidate;

  @ManyToOne(() => Candidate, candidate => candidate.substitutesNew, { nullable: true })
  @Field(() => Candidate, { nullable: true })
  newCandidate: Candidate;

  // Dates

  @CreateDateColumn()
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date, { nullable: true })
  updatedAt: Date;
}

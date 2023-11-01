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
export class Grade {
  // Primary Generated columns

  @Field(() => Int, { description: '', nullable: true })
  @PrimaryGeneratedColumn()
  id: number;

  // Normal Columns

  @Column({ unique: true })
  @Field({ nullable: true })
  name: string;

  @Column()
  @Field(() => Int, { nullable: true })
  pointGroup: number;

  @Column()
  @Field(() => Int, { nullable: true })
  pointSingle: number;

  @Column()
  @Field(() => Int, { nullable: true })
  pointHouse: number;

  @Column()
  @Field(() => Int, { nullable: true })
  percentage: number;

  // OneTOMany relations

  @Field(() => [CandidateProgramme], { nullable: true })
  @OneToMany(() => CandidateProgramme, candidateProgramme => candidateProgramme.grade)
  candidateProgramme: CandidateProgramme[];

  // Dates

  @CreateDateColumn()
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date, { nullable: true })
  updatedAt: Date;
}

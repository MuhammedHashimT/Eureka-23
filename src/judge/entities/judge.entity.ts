import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Programme } from 'src/programmes/entities/programme.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Judge {
  // Primary Generated columns

  @Field(() => Int, { description: '', nullable: true })
  @PrimaryGeneratedColumn()
  id: number;

  // Normal Columns

  @Column({ unique: true })
  @Field({ nullable: true })
  username: string;

  @Column()
  @Field({ nullable: true })
  password: string;

  @Column()
  @Field({ nullable: true })
  judgeName: string;

  // OneTOMany relations

  @ManyToOne(() => Programme, programme => programme.judges, { nullable: true })
  @Field(() => Programme, { nullable: true })
  programme: Programme;

  // Dates

  @CreateDateColumn()
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date, { nullable: true })
  updatedAt: Date;
}

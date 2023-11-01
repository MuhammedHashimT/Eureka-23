import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { CandidateProgramme } from 'src/candidate-programme/entities/candidate-programme.entity';
import { Category } from 'src/category/entities/category.entity';
import { CustomSetting } from 'src/custom-settings/entities/custom-setting.entity';
import { Judge } from 'src/judge/entities/judge.entity';
import { Skill } from 'src/skill/entities/skill.entity';
import { Substitute } from 'src/substitute/entities/substitute.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Mode {
  STAGE = 'STAGE',
  NON_STAGE = 'NON_STAGE',
  OUTDOOR_STAGE = 'OUTDOOR_STAGE',
}

export enum Type {
  SINGLE = 'SINGLE',
  GROUP = 'GROUP',
  HOUSE = 'HOUSE',
}

export enum  Model {
  Arts = 'Arts',
  Sports = 'Sports',
}

registerEnumType(Mode, {
  name: 'Modes',
});

registerEnumType(Type, {
  name: 'Types',
});

registerEnumType(Model, {
  name: 'Models',
});

@ObjectType()
@Entity()
export class Programme {
  // Primary generated ID

  @Field(() => Int, { description: 'Example field (placeholder)', nullable: true })
  @PrimaryGeneratedColumn()
  id: number;

  // Normal columns

  @Column({ unique: true })
  @Field({ nullable: true })
  programCode: string;

  @Column()
  @Field({ nullable: true })
  name: string;

  @Column()
  @Field(() => Mode, { nullable: true })
  mode: Mode;

  @Column()
  @Field(() => Type, { nullable: true })
  type: Type;

  @Column()
  @Field(() => Model, { nullable: true })
  model: Model;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  groupCount: number;

  @Column()
  @Field(() => Int, { nullable: true })
  candidateCount: number;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  date: Date;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  venue: number;

  @Column()
  @Field(() => Int)
  duration: number;

  @Field(() => Int, { nullable: true })
  @Column({ default: 10 })
  totalMark: number;

  @Column()
  @Field({ nullable: true })
  conceptNote: string;

  @Column({ default: false })
  @Field(() => Boolean, { defaultValue: false })
  resultEntered: Boolean;

  @Column({ default: false })
  @Field(() => Boolean, { defaultValue: false })
  resultPublished: Boolean;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  checkToReadNo: number;

  @Column({ default: false })
  @Field(() => Boolean, { defaultValue: false })
  anyIssue: boolean;


  // OneToMany relations

  @OneToMany(() => CandidateProgramme, CandidateProgramme => CandidateProgramme.programme)
  @JoinTable()
  @Field(() => [CandidateProgramme], { nullable: true })
  candidateProgramme: CandidateProgramme[];

  @OneToMany(() => Judge, judge => judge.programme, { nullable: true })
  @Field(() => [Judge], { nullable: true })
  @JoinTable()
  judges: Judge[];

  @OneToMany(() => Substitute, Substitute => Substitute.programme)
  @JoinTable()
  @Field(() => [Substitute], { nullable: true })
  substitutes: Substitute[];

  // ManyTOOne relations

  @ManyToOne(() => Skill, skill => skill.programmes, { eager: true, onDelete: 'SET NULL' })
  @Field(() => Skill, { nullable: true })
  skill: Skill;

  @ManyToOne(() => Category, category => category.programmes, { eager: true, onDelete: 'SET NULL' })
  @Field(() => Category, { nullable: true })
  category: Category;

  @ManyToOne(() => CustomSetting , customSetting => customSetting.programmes, { eager: true, onDelete: 'SET NULL' })
  @Field(() => CustomSetting, { nullable: true })
  customSetting: CustomSetting;

  // Dates

  @Expose()
  @Field(() => Date, { nullable: true })
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @Field(() => Date, { nullable: true })
  @UpdateDateColumn()
  updatedAt: Date;
}

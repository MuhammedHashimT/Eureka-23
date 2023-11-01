import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Candidate } from 'src/candidates/entities/candidate.entity';
import { CategorySettings } from 'src/category-settings/entities/category-setting.entity';
import { Credential } from 'src/credentials/entities/credential.entity';
import { CustomSetting } from 'src/custom-settings/entities/custom-setting.entity';
import { Programme } from 'src/programmes/entities/programme.entity';
import { Section } from 'src/sections/entities/section.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Category {
  // Primary generated ID

  @Field(() => Int, { description: '' , nullable: true })
  @PrimaryGeneratedColumn()
  id: number;

  // Normal columns

  @Column({ unique: true })
  @Field( { nullable: true })
  name: string;

  // OneToOne relations

  @Field(() => CategorySettings , { nullable: true })
  @OneToOne(() => CategorySettings, settings => settings)
  @JoinColumn()
  settings: CategorySettings;

  // OneToMany relations

  @OneToMany(() => Candidate, Candidate => Candidate.category)
  @JoinColumn()
  @Field(() => [Candidate], { nullable: true })
  candidates: Candidate[];

  @OneToMany(() => Programme, programme => programme.category)
  @JoinColumn()
  @Field(() => [Programme], { nullable: true })
  programmes: Programme[];

  @OneToMany(() => CustomSetting , customSetting  => customSetting.category)
  @JoinColumn()
  @Field(() => [CustomSetting], { nullable: true })
  customSettings: CustomSetting[];

  // ManyTOOne relations

  @ManyToOne(() => Section, section => section.categories, { eager: true, onDelete: 'SET NULL' })
  @Field(() => Section , { nullable: true })
  section: Section;

  // ManyToMany relations

  @ManyToMany(() => Credential, credential => credential.categories)
  @Field(() => [Credential], { nullable: true })
  credentials: Credential[];

  // Dates

  @CreateDateColumn()
  @Field(() => Date , { nullable: true })
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date , { nullable: true })
  updatedAt: Date;
}

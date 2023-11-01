import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Programme } from 'src/programmes/entities/programme.entity';
import { Category } from 'src/category/entities/category.entity';

@ObjectType()
@Entity()
export class CustomSetting {
  @PrimaryGeneratedColumn()
  @Field(() => Int, { description: 'Example field (placeholder)' })
  id: number;

  @Column()
  @Field({ nullable: true })
  name : string;

  @OneToMany(() => Programme, (programme) => programme.customSetting)
  @Field(()=> [Programme] , { nullable: true })
  @JoinTable()
  programmes : Programme[];

  @ManyToOne(() => Category, (category) => category.customSettings)
  @Field(()=> Category, { nullable: true })
  category : Category;

  @Column()
  @Field({ nullable: true })
  max : number;

  @Column()
  @Field({ nullable: true })
  min : number;


  @CreateDateColumn()
  @Field(() => Date, { description: 'Date of creation' })
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date, { description: 'Date of last update' })
  updatedAt: Date;
}

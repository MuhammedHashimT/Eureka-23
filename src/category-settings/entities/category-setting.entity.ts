import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Category } from 'src/category/entities/category.entity';
import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
@Entity()
export class CategorySettings {

  @Field(() => Int , {nullable : true})
  @PrimaryGeneratedColumn()
  id: number

  // MAX

  @Field(() => Int , {nullable : true})
  @Column()
  maxProgram: number;
 
  @Field(() => Int , {nullable : true})
  @Column()
  maxSingle: number;
  
  @Field(() => Int , {nullable : true})
  @Column()
  maxGroup : number;

  @Field(() => Int , {nullable : true})
  @Column()
  maxStage: number;

  @Field(() => Int , {nullable : true})
  @Column()
  maxNonStage: number;

  @Field(() => Int , {nullable : true})
  @Column()
  maxOutDoor: number;

  // ON SPORTS

  @Field(() => Int , {nullable : true})
  @Column()
  maxSports: number;

  @Field(() => Int , {nullable : true})
  @Column()
  maxSportsSingle: number;

  @Field(() => Int , {nullable : true})
  @Column()
  maxSportsGroup : number;

  // MIN
  @Field(() => Int , {nullable : true})
  @Column()
  minProgram: number;

  @Field(() => Int , {nullable : true})
  @Column()
  minSingle: number;

  @Field(() => Int , {nullable : true})
  @Column()
  minGroup : number;
  
  @Field(() => Int , {nullable : true})
  @Column()
  minStage: number;

  @Field(() => Int , {nullable : true})
  @Column()
  minNonStage: number;

  @Field(() => Int , {nullable : true})
  @Column()
  minOutDoor: number;
  
  // ON SPORTS

  @Field(() => Int , {nullable : true})
  @Column()
  minSports: number;

  @Field(() => Int , {nullable : true})
  @Column()
  minSportsSingle: number;

  @Field(() => Int , {nullable : true})
  @Column()
  minSportsGroup : number;

  @Field(() => Boolean , {defaultValue : false})
  @Column({default : false})
  isProgrammeListUpdatable: boolean;

  @OneToOne(()=> Category , (category)=> category.settings)
  @Field(()=>Category , {nullable : true})
  category:Category;

  // Date Time
  @Field(() => Date , {nullable : true})
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date , {nullable : true})
  @UpdateDateColumn()
  updatedAt: Date;

}

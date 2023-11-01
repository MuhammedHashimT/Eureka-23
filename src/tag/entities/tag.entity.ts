import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Gallery } from 'src/gallery/entities/gallery.entity';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Field()
  @Column( { unique: true })
  name: string;

  // many to many relation with gallery

  @Field(() => [Gallery])
  @ManyToMany(() => Gallery , gallery => gallery.tags , { eager: true , onDelete: 'SET NULL'  })
  @JoinTable()
  galleries: Gallery[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

}

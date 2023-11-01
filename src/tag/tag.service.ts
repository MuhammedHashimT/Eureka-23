import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateTagInput } from './dto/create-tag.input';
import { UpdateTagInput } from './dto/update-tag.input';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import {GalleryService} from 'src/gallery/gallery.service'
import { Gallery } from 'src/gallery/entities/gallery.entity';

@Injectable()
export class TagService {

  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @Inject(forwardRef(() => GalleryService))
    private readonly galleryService : GalleryService
  ) {}

  create(createTagInput: CreateTagInput) {
    const tag = this.tagRepository.create(createTagInput);

    try{
      return this.tagRepository.save(tag);
    }
    catch(error){
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  findAll() {
    try{
      return this.tagRepository.find(
        {
          relations: ['galleries']
        }
      );
    }
    catch(error){
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  findOne(id: number) {
    try{
      return this.tagRepository.findOne({
        where: { id },
        relations: ['galleries']
      });
    }
    catch(error){
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

 async findTagsOfGallery(id : number){
   const gallery =await this.galleryService.findOne(id);
console.log(id);

    try{
      const findOptions :FindOneOptions<Tag> = {
        where: {
         galleries: gallery.id
        } as FindOptionsWhere<Gallery>,
      }
      console.log(findOptions);
      
      return this.tagRepository.find(findOptions);

      // doing the top code with query builder
      // const gal = await this.tagRepository.createQueryBuilder('tag')
      // .leftJoinAndSelect('tag.galleries', 'gallery')
      // .where('gallery.id = :id', {id})
      // .getMany();
      // console.log(gal);

      // const gal = await this.tagRepository.query(`
      // SELECT tag.name , tag.id
      // FROM tag
      // JOIN gallery AS gallery on tag.id = ${id}
      // WHERE gallery.id = ${id}
      // ` 
      // );
      
      // return gal;
    }
    catch(error){
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  findByName(name: string) {
    try{
      return this.tagRepository.findOne({
        where: { name },
        relations: ['galleries']
      });
    }
    catch(error){
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

async  update(id: number, updateTagInput: UpdateTagInput) {
    const tag =await this.tagRepository.findOne({where : {id}})
    Object.assign(tag , updateTagInput)
    try{
      return this.tagRepository.save(tag)
    }
    catch(error){
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async addGallery(id: number, galleryId: number) {
    try{
      const tag : Tag = await this.findOne(id);
      const gallery : Gallery= await this.galleryService.findOne(galleryId);

      tag.galleries.push(gallery);

      return this.tagRepository.save(tag);
    }
    catch(error){

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }



  remove(id: number) {
    try{
      return this.tagRepository.delete(id);
    }
    catch(error){
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}

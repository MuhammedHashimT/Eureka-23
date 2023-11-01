import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSectionInput } from './dto/create-section.input';
import { UpdateSectionInput } from './dto/update-section.input';
import { Section } from './entities/section.entity';
import { fieldsIdChecker, fieldsValidator } from '../utils/util';

@Injectable()
export class SectionsService {
  constructor(@InjectRepository(Section) private sectionRepository: Repository<Section>) {}

  create(createSectionInput: CreateSectionInput) {
    try {
      const newSectionInput = this.sectionRepository.create(createSectionInput);
      return this.sectionRepository.save(newSectionInput);
    } catch (e) {
      throw new HttpException(
        'An Error have when finding data ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

async  findAll(fields: string[]) {
    const allowedRelations = [
      'categories',
     ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.sectionRepository
        .createQueryBuilder('section')
        .leftJoinAndSelect('section.categories', 'categories')
        .orderBy('section.id', 'ASC')

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `section.${column}`;
          }
        }),
      );
      const section = await queryBuilder.getMany();
      return section;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding section ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

 async findOne(id: number , fields: string[]) {
    if (!id) {
      throw new HttpException(`section cannot be undefined`, HttpStatus.BAD_REQUEST);
    }
    const allowedRelations = [
      'categories',
     ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.sectionRepository
        .createQueryBuilder('section')
        .where('section.id = :id', { id })
        .leftJoinAndSelect('section.categories', 'categories')
        .orderBy('section.id', 'ASC')

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `section.${column}`;
          }
        }),
      );
      const section = await queryBuilder.getOne();
      return section;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding section ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

async  findOneByName(name: string , fields: string[]) {
    if (!name) {
      throw new HttpException(`section cannot be undefined`, HttpStatus.BAD_REQUEST);
    }
    const allowedRelations = [
      'categories',
     ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.sectionRepository
        .createQueryBuilder('section')
        .where('section.name = :name', { name })
        .leftJoinAndSelect('section.categories', 'categories')
        .orderBy('section.id', 'ASC')

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `section.${column}`;
          }
        }),
      );
      const section = await queryBuilder.getOne();
      return section;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding section ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async update(id: number, updateSectionInput: UpdateSectionInput) {
    const section = await this.sectionRepository.findOneBy({ id });

    if (!section) {
      throw new HttpException(`Cant find a section `, HttpStatus.BAD_REQUEST);
    }
    // trying to return data

    Object.assign(section,updateSectionInput)

    try {
      return this.sectionRepository.save(section)
      // this.sectionRepository.update(id, updateSectionInput);
    } catch (e) {
      throw new HttpException(
        'An Error have when updating section ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async remove(id: number) {
    const section = await this.sectionRepository.findOneBy({ id });

    if (!section) {
      throw new HttpException(`Cant find a section `, HttpStatus.BAD_REQUEST);
    }
    // trying to return section

    try {
      return this.sectionRepository.delete(id);
    } catch (e) {
      throw new HttpException(
        'An Error have when deleting section ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }
}

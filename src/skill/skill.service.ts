import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSkillInput } from './dto/create-skill.input';
import { UpdateSkillInput } from './dto/update-skill.input';
import { Skill } from './entities/skill.entity';
import { fieldsIdChecker, fieldsValidator } from 'src/utils/util';

@Injectable()
export class SkillService {
  constructor(@InjectRepository(Skill) private skillRepository: Repository<Skill>) {}

  create(createSkillInput: CreateSkillInput) {
    const newSkillInput = this.skillRepository.create(createSkillInput);
    return this.skillRepository.save(newSkillInput);
  }

async  findAll( fields: string[]) {
    const allowedRelations = ['programmes', 'programmes.category' ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.skillRepository
        .createQueryBuilder('skill')
        .leftJoinAndSelect('skill.programmes', 'programmes')
        .leftJoinAndSelect('programmes.category', 'category')
        .orderBy('skill.id', 'ASC');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `skill.${column}`;
          }
        }),
      );
      const skill = await queryBuilder.getMany();
      return skill;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding skill ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

 async findOneByName(name: string , fields: string[]) {
    const allowedRelations = ['programmes', 'programmes.category' ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.skillRepository
        .createQueryBuilder('skill')
        .where('skill.name = :name', { name })
        .leftJoinAndSelect('skill.programmes', 'programmes')
        .leftJoinAndSelect('programmes.category', 'category')
        .orderBy('skill.id', 'ASC');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `skill.${column}`;
          }
        }),
      );
      const skill = await queryBuilder.getOne();
      return skill;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding skill ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

async  findOne(id: number , fields: string[]) {
    const allowedRelations = ['programmes', 'programmes.category' ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.skillRepository
        .createQueryBuilder('skill')
        .where('skill.id = :id', { id })
        .leftJoinAndSelect('skill.programmes', 'programmes')
        .leftJoinAndSelect('programmes.category', 'category')
        .orderBy('skill.id', 'ASC');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `skill.${column}`;
          }
        }),
      );
      const skill = await queryBuilder.getOne();
      return skill;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding skill ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

 async update(id: number, updateSkillInput: UpdateSkillInput) {
    const skill = await this.skillRepository.findOneBy({ id });

    if (!skill) {
      throw new HttpException(`Cant find a skill `, HttpStatus.BAD_REQUEST);
    }
    // trying to return data
    Object.assign(skill,updateSkillInput)
    try {
      return this.skillRepository.save(skill)
    } catch (e) {
      throw new HttpException(
        'An Error have when updating data ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

 async remove(id: number) {
    const skill = await this.skillRepository.findOneBy({ id });

    if (!skill) {
      throw new HttpException(`Cant find a skill `, HttpStatus.BAD_REQUEST);
    }
    // trying to return data

    try {
      return this.skillRepository.delete(id);
    } catch (e) {
      throw new HttpException(
        'An Error have when deleting data ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }
}

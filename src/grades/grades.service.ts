import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGradeInput } from './dto/create-grade.input';
import { UpdateGradeInput } from './dto/update-grade.input';
import { Grade } from './entities/grade.entity';
import { fieldsIdChecker, fieldsValidator } from 'src/utils/util';

@Injectable()
export class GradesService {
  constructor(@InjectRepository(Grade) private gradeRepository: Repository<Grade>) { }

  create(createGradeInput: CreateGradeInput) {
    try {
      const newGradeInput = this.gradeRepository.create(createGradeInput);
      return this.gradeRepository.save(newGradeInput);
    } catch (e) {
      throw new HttpException(
        'An Error have when inserting data ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findAll(fields: string[]) {
    const allowedRelations = [
      'candidateProgramme',
      'candidateProgramme.candidate',
      'candidateProgramme.programme',
    ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.gradeRepository
        .createQueryBuilder('grade')
        .leftJoinAndSelect('grade.candidateProgramme', 'candidateProgramme')
        .leftJoinAndSelect('candidateProgramme.candidate', 'candidate')
        .leftJoinAndSelect('candidateProgramme.programme', 'programme');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `grade.${column}`;
          }
        }),
      );
      const grade = await queryBuilder.getMany();
      return grade;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding grade ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findOne(id: number, fields: string[]) {
    const allowedRelations = [
      'candidateProgramme',
      'candidateProgramme.candidate',
      'candidateProgramme.programme',
    ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.gradeRepository
        .createQueryBuilder('grade')
        .where('grade.id = :id', { id })
        .leftJoinAndSelect('grade.candidateProgramme', 'candidateProgramme')
        .leftJoinAndSelect('candidateProgramme.candidate', 'candidate')
        .leftJoinAndSelect('candidateProgramme.programme', 'programme');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `grade.${column}`;
          }
        }),
      );
      const grade = await queryBuilder.getOne();
      return grade;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding grade ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }


  async findOneByName(name: string, fields: string[]) {
    const allowedRelations = [
      'candidateProgramme',
      'candidateProgramme.candidate',
      'candidateProgramme.programme',
    ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.gradeRepository
        .createQueryBuilder('grade')
        .where('grade.name = :name', { name })
        .leftJoinAndSelect('grade.candidateProgramme', 'candidateProgramme')
        .leftJoinAndSelect('candidateProgramme.candidate', 'candidate')
        .leftJoinAndSelect('candidateProgramme.programme', 'programme');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `grade.${column}`;
          }
        }),
      );
      const grade = await queryBuilder.getOne();
      return grade;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding grade ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async update(id: number, updateGradeInput: UpdateGradeInput) {
    // checking is grade exist
    const grade = await this.gradeRepository.findOneBy({ id });

    if (!grade) {
      throw new HttpException(`Cant find a grade `, HttpStatus.BAD_REQUEST);
    }
    // trying to return data

    Object.assign(grade, updateGradeInput)

    try {
      this.gradeRepository.save(grade)
      return grade;
    } catch (e) {
      throw new HttpException(
        'An Error have when updating data ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async remove(id: number) {
    const grade = await this.gradeRepository.findOneBy({ id });

    if (!grade) {
      throw new HttpException(`Cant find a grade to delete`, HttpStatus.BAD_REQUEST);
    }
    // trying to delete data

    try {
      return this.gradeRepository.delete(id);
    } catch (e) {
      throw new HttpException(
        'An Error have when deleting data ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }
}

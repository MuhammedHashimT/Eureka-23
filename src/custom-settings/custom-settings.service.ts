import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCustomSettingInput } from './dto/create-custom-setting.input';
import { UpdateCustomSettingInput } from './dto/update-custom-setting.input';
import { CustomSetting } from './entities/custom-setting.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgrammesService } from 'src/programmes/programmes.service';
import { CategoryService } from 'src/category/category.service';
import { Programme } from 'src/programmes/entities/programme.entity';
import { fieldsIdChecker, fieldsValidator } from 'src/utils/util';

@Injectable()
export class CustomSettingsService {
  constructor(
    @InjectRepository(CustomSetting)
    private customSettingRepository: Repository<CustomSetting>,
    private readonly programmesService: ProgrammesService,
    private readonly categoryService: CategoryService,
  ) {}

  async create(createCustomSettingInput: CreateCustomSettingInput) {
    const { name, programs, category, min, max } = createCustomSettingInput;

    // check the name is unique
    const customSetting: CustomSetting = await this.findOneByName(name , ['id']);

    if (customSetting) {
      throw new HttpException(
        `Custom Setting with name ${name} already exists`,
        HttpStatus.BAD_REQUEST,
      );
    }
    // check the program is valid

    const programmes: Programme[] = [];

    for (let index = 0; index < programs.length; index++) {
      const program = programs[index];

      const programObj = await this.programmesService.findOneByCodeForCheck(program);

      if (!programObj) {
        throw new HttpException(
          `Program with code ${program} does not exists`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const programmeInCustomSetting : CustomSetting = await this.findByProgramCode(program)

      if(programmeInCustomSetting){
        throw new HttpException(
          `Program with code ${program} already exists in custom setting`,
          HttpStatus.BAD_REQUEST,
        );
      }
      programmes.push(programObj);
    }

    // check the category is valid

    const categoryObj = await this.categoryService.findOneByName(category);

    if (!categoryObj) {
      throw new HttpException(
        `Category with name ${category} does not exists`,
        HttpStatus.BAD_REQUEST,
      );
    }


    try {
      const newCustomSetting = this.customSettingRepository.create({
        name,
        programmes,
        category: categoryObj,
        min,
        max,
      });

      return this.customSettingRepository.save(newCustomSetting);
    } catch (e) {
      throw new HttpException(
        'An Error have when inserting settings , please check the all required fields are filled ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findAll(fields: string[]) {
    const allowedRelations = ['category', 'programmes'];
    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.customSettingRepository
        .createQueryBuilder('customSetting')
        .leftJoinAndSelect('customSetting.category', 'category')
        .leftJoinAndSelect('customSetting.programmes', 'programmes')
        .orderBy('customSetting.id', 'ASC');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `customSetting.${column}`;
          }
        }),
      );
      const customSetting = await queryBuilder.getMany();
      return customSetting;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding customSetting ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findOne(id: number, fields: string[]) {
    const allowedRelations = ['category', 'programmes'];
    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    console.log(fields);
    
    try {
      const queryBuilder = this.customSettingRepository
        .createQueryBuilder('customSetting')
        .where('customSetting.id = :id', { id })
        .leftJoinAndSelect('customSetting.category', 'category')
        .leftJoinAndSelect('customSetting.programmes', 'programmes')
        .orderBy('customSetting.id', 'ASC');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `customSetting.${column}`;
          }
        }),
      );
      const customSetting = await queryBuilder.getOne();
      return customSetting;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding customSetting ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

 async findOneByName(name: string , fields: string[]) {
    const allowedRelations = ['category', 'programmes'];
    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.customSettingRepository
        .createQueryBuilder('customSetting')
        .where('customSetting.name = :name', { name })
        .leftJoinAndSelect('customSetting.category', 'category')
        .leftJoinAndSelect('customSetting.programmes', 'programmes')
        .orderBy('customSetting.id', 'ASC');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `customSetting.${column}`;
          }
        }),
      );
      const customSetting = await queryBuilder.getOne();
      return customSetting;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding customSetting ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async update(id: number, updateCustomSettingInput: UpdateCustomSettingInput) {
    const { name, programs, category, min, max } = updateCustomSettingInput;

    // check the name is unique
    const customSetting: CustomSetting = await this.findOneByName(name , ['id']);

    if (customSetting && customSetting.id!== id) {
      throw new HttpException(
        `Custom Setting with name ${name} already exists`,
        HttpStatus.BAD_REQUEST,
      );
    }
    // check the program is valid

    const programmes: Programme[] = [];

    for (let index = 0; index < programs.length; index++) {
      const program = programs[index];

      const programObj = await this.programmesService.findOneByCodeForCheck(program);

      if (!programObj) {
        throw new HttpException(
          `Program with code ${program} does not exists`,
          HttpStatus.BAD_REQUEST,
        );

        // check programme is already in custom setting
      }

      const programmeInCustomSetting : CustomSetting = await this.findByProgramCode(program)

      if(programmeInCustomSetting && customSetting.id !== id){
        throw new HttpException(
          `Program with code ${program} already exists in custom setting`,
          HttpStatus.BAD_REQUEST,
        );
      }

      programmes.push(programObj);
    }

    // check the category is valid

    const categoryObj = await this.categoryService.findOneByName(category);

    if (!categoryObj) {
      throw new HttpException(
        `Category with name ${category} does not exists`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return this.customSettingRepository.save({
        id,
        name,
        programmes,
        category: categoryObj,
        min,
        max,
      });
    } catch (e) {
      throw new HttpException(
        'An Error have when inserting settings , please check the all required fields are filled ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

 async findByProgramCode(programCode: string){
    return this.customSettingRepository
    .createQueryBuilder('customSetting')
    .leftJoinAndSelect('customSetting.programmes', 'programmes')
   .where('programmes.programCode = :programCode', { programCode })
   .select('customSetting.id')
   .getOne();
  }

  async remove(id: number) {
    const customSetting = this.findOne(id, ['id']);

    if (!customSetting) {
      throw new HttpException(
        `Custom Setting with id ${id} does not exists`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return this.customSettingRepository.delete(id);
    } catch (e) {
      throw new HttpException(
        'An Error have when inserting settings , please check the all required fields are filled ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }
}

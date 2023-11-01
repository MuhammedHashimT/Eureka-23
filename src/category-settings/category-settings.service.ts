import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategorySettingInput } from './dto/create-category-setting.input';
import { UpdateCategorySettingInput } from './dto/update-category-setting.input';
import { CategorySettings } from './entities/category-setting.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryService } from 'src/category/category.service';
import { Credential } from 'src/credentials/entities/credential.entity';
import { CredentialsService } from 'src/credentials/credentials.service';
import { fieldsIdChecker, fieldsValidator } from 'src/utils/util';

@Injectable()
export class CategorySettingsService {
  constructor(
    @InjectRepository(CategorySettings)
    private categorySettingsRepository: Repository<CategorySettings>,
    private categoryService: CategoryService,
    private credentialService: CredentialsService,
  ) {}

  async create(createCategorySettingInput: CreateCategorySettingInput, user: Credential) {
    const category = await this.categoryService.findOneByName(createCategorySettingInput.category);

    if (!category) {
      throw new HttpException(`Invalid category name`, HttpStatus.BAD_REQUEST);
    }

    // authenticating the user have permission to update the category

    this.credentialService.checkPermissionOnCategories(user, category.name);

    const newData = this.categorySettingsRepository.create({
      maxGroup: createCategorySettingInput.maxGroup,
      maxSingle: createCategorySettingInput.maxSingle,
      maxProgram: createCategorySettingInput.maxProgram,
      minGroup: createCategorySettingInput.minGroup,
      minSingle: createCategorySettingInput.minSingle,
      minProgram: createCategorySettingInput.minProgram,
    });

    const savedSettings = await this.categorySettingsRepository.save(newData);

    category.settings = savedSettings;
    const addSettings = await this.categoryService.addSettingsToCategory(category.id, category);

    return savedSettings;
  }

  async findAll(fields: string[]) {
    const allowedRelations = ['category'];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.categorySettingsRepository
        .createQueryBuilder('category_settings')
        .leftJoinAndSelect('category_settings.category', 'category');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `category_settings.${column}`;
          }
        }),
      );
      const category_settings = await queryBuilder.getMany();
      return category_settings;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding category_settings ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findOne(id: number, fields: string[]) {
    const allowedRelations = ['category'];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.categorySettingsRepository
        .createQueryBuilder('category_settings')
        .where('category_settings.id = :id', { id })
        .leftJoinAndSelect('category_settings.category', 'category');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `category_settings.${column}`;
          }
        }),
      );
      const category_settings = await queryBuilder.getOne();
      return category_settings;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding category_settings ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async update(
    id: number,
    updateCategorySettingInput: UpdateCategorySettingInput,
    user: Credential,
  ) {
    // checking is category_settings exist
    const category_settings = await this.categorySettingsRepository.findOneBy({ id });

    if (!category_settings) {
      throw new HttpException(`Invalid category settings id`, HttpStatus.BAD_REQUEST);
    }

    // checking is category exist
    const category = await this.categoryService.findOneByName(updateCategorySettingInput.category);

    if (!category) {
      throw new HttpException(`Invalid category name`, HttpStatus.BAD_REQUEST);
    }

    // authenticating the user have permission to update the category

    this.credentialService.checkPermissionOnCategories(user, category.name);

    Object.assign(category_settings,updateCategorySettingInput)

    const savedSettings = await this.categorySettingsRepository.save(category_settings)

    category.settings = category_settings;
    try {
      return this.categoryService.addSettingsToCategory(category.id, category);
    } catch (e) {
      throw new HttpException(
        'An Error have when updating data ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async remove(id: number, user: Credential) {
    // checking is category_settings exist
    const category_settings = await this.findOne(id, ['category.name']);

    // checking is category exist
    const category = await this.categoryService.findOneByName(category_settings.category.name);

    if (!category) {
      throw new HttpException(`Invalid category name`, HttpStatus.BAD_REQUEST);
    }

    // authenticating the user have permission to update the category

    this.credentialService.checkPermissionOnCategories(user, category.name);

    if (!category_settings) {
      throw new HttpException(`Invalid category settings id`, HttpStatus.BAD_REQUEST);
    }
    try {
      return this.categorySettingsRepository.delete(id);
    } catch (e) {
      throw new HttpException(
        'An Error have when deleting data ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async updateStatus(categoryName: string, user: Credential) {
    const category = await this.categoryService.findOneByName(categoryName);
    if (!category) {
      throw new HttpException(`Invalid category name`, HttpStatus.BAD_REQUEST);
    }

    // authenticating the user have permission to update the category

    this.credentialService.checkPermissionOnCategories(user, category.name);

    const categorySettings = category.settings;

    if (!categorySettings) {
      throw new HttpException(`Invalid category settings id`, HttpStatus.BAD_REQUEST);
    }

    try {

      categorySettings.isProgrammeListUpdatable = !categorySettings.isProgrammeListUpdatable ;

      const savedSettings = await this.categorySettingsRepository.save(categorySettings)
      return savedSettings;
    } catch (e) {
      throw new HttpException(
        'An Error have when updating data ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateProgrammeInput } from './dto/create-programme.input';
import { UpdateProgrammeInput } from './dto/update-programme.input';
import { Mode, Model, Programme, Type } from './entities/programme.entity';
import { CategoryService } from 'src/category/category.service';
import { SkillService } from 'src/skill/skill.service';
import { CreateSchedule } from './dto/create-schedule.dto';
import { Credential } from 'src/credentials/entities/credential.entity';
import { DetailsService } from 'src/details/details.service';
import { Category } from 'src/category/entities/category.entity';
import { Skill } from 'src/skill/entities/skill.entity';
import { CredentialsService } from '../credentials/credentials.service';
import { createInput } from './dto/create-inputs.inputs';
import { fieldsIdChecker, fieldsValidator, isDateValid } from 'src/utils/util';

@Injectable()
export class ProgrammesService {
  constructor(
    @InjectRepository(Programme) private programmeRepository: Repository<Programme>,
    private skillService: SkillService,
    private categoryService: CategoryService,
    private detailsService: DetailsService,
    private readonly CredentialService: CredentialsService,
  ) {}

  //  To create many Programmes at a time , usually using on Excel file upload

  async createMany(createProgrammeInputArray: createInput, user: Credential) {
    // the final data variable
    var FinalData: Programme[] = [];
    const allData: {
      name: string;
      programmeCode: string;
      category: Category;
      skill: Skill;
      mode: Mode;
      type: Type;
      duration: number;
      candidateCount: number;
      groupCount: number;
      conceptNote: string;
      model : Model;
    }[] = [];

    // Iterate the values and taking all the individuals

    for (let index = 0; index < createProgrammeInputArray.inputs.length; index++) {
      const createProgrammeInput = createProgrammeInputArray.inputs[index];

      //  checking is category exist

      const category_id = await this.categoryService.findOneByName(createProgrammeInput.category);

      if (!category_id) {
        throw new HttpException(
          `Cant find a category named ${createProgrammeInput.category}  ,ie: check on Category of ${createProgrammeInput.name}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // authenticating the user have permission to update the category

      this.CredentialService.checkPermissionOnCategories(user, category_id.name);

      const IS_SKILL_REQUIRED = (await this.detailsService.findIt()).isSkillHave;

      //  checking is skill exist

      let skill_id = await this.skillService.findOneByName(createProgrammeInput.skill, ['id']);

      if (IS_SKILL_REQUIRED) {
        if (!createProgrammeInput.skill) {
          throw new HttpException(
            `Skill is required ,ie: check on Skill of ${createProgrammeInput.name}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        if (!skill_id) {
          throw new HttpException(
            `Cant find a skill named ${createProgrammeInput.skill} ,ie: check on skill of ${createProgrammeInput.name}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        skill_id = null;
      }

      // checking is programmeCode already exist
      const Programme = await this.programmeRepository.findOne({
        where: {
          programCode: createProgrammeInput.programCode,
        },
      });

      if (Programme) {
        throw new HttpException(
          `Programme with programme code ${createProgrammeInput.programCode} already exists ,ie: check on programme code of ${createProgrammeInput.name}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // checking is programmeCode already exist in the allData array

      const isProgrammeCodeExist = allData.some(
        data => data.programmeCode === createProgrammeInput.programCode,
      );

      if (isProgrammeCodeExist) {
        throw new HttpException(
          `Multiple programmes with programme code ${createProgrammeInput.programCode} found ,ie: check on programme code of ${createProgrammeInput.name}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // pushing the data to allData array

      allData.push({
        name: createProgrammeInput.name,
        programmeCode: createProgrammeInput.programCode,
        category: category_id,
        skill: skill_id,
        mode: createProgrammeInput.mode,
        type: createProgrammeInput.type,
        duration: createProgrammeInput.duration,
        candidateCount: createProgrammeInput.candidateCount,
        groupCount: createProgrammeInput.groupCount,
        conceptNote: createProgrammeInput.conceptNote,
        model : createProgrammeInput.model,
      });
    }

    // looping the values

    try {
      // checking is all programme checked

      if (allData.length !== createProgrammeInputArray.inputs.length) {
        throw new HttpException(
          'Some programmes are not eligible to create ',
          HttpStatus.BAD_REQUEST,
        );
      }

      for (let index = 0; index < allData.length; index++) {
        const data = allData[index];

        // creating a instance of Programme
        const input = new Programme();

        // updating Value to Programme
        input.candidateCount = data.candidateCount;
        input.category = data.category;
        input.duration = data.duration;
        input.mode = data.mode;
        input.name = data.name;
        input.programCode = data.programmeCode;
        input.skill = data.skill;
        input.type = data.type;
        input.groupCount = data.groupCount;
        input.conceptNote = data.conceptNote;
        input.model = data.model;

        let saveData = await this.programmeRepository.save(input);

        FinalData.push(saveData);
      }

      return FinalData;
    } catch (e) {
      throw new HttpException(
        'An Error have when inserting data , please check the all required fields are filled ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async create(createProgrammeInput: CreateProgrammeInput, user: Credential) {
    // checking the programme is already exist
    const programme = await this.programmeRepository.findOne({
      where: {
        programCode: createProgrammeInput.programCode,
      },
    });

    if (programme) {
      throw new HttpException(
        'Programme with this programme code already exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    //  checking is category exist

    const category_id = await this.categoryService.findOneByName(createProgrammeInput.category);

    if (!category_id) {
      throw new HttpException(
        `Cant find a category named ${createProgrammeInput.category}  ,ie: check on Category of ${createProgrammeInput.name}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // authenticating the user have permission to update the category

    this.CredentialService.checkPermissionOnCategories(user, category_id.name);

    //  checking is skill exist

    const IS_SKILL_REQUIRED = (await this.detailsService.findIt()).isSkillHave;

    //  checking is skill exist

    let skill_id = await this.skillService.findOneByName(createProgrammeInput.skill, ['id']);

    if (IS_SKILL_REQUIRED) {
      if (!createProgrammeInput.skill) {
        throw new HttpException(
          `Skill is required ,ie: check on Skill of ${createProgrammeInput.name}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!skill_id) {
        throw new HttpException(
          `Cant find a skill named ${createProgrammeInput.skill} ,ie: check on skill of ${createProgrammeInput.name}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      skill_id = null;
    }

    try {
      // creating a instance of Programme
      const input = new Programme();

      // updating Value to Programme
      input.candidateCount = createProgrammeInput.candidateCount;
      input.category = category_id;
      input.duration = createProgrammeInput.duration;
      input.mode = createProgrammeInput.mode;
      input.name = createProgrammeInput.name;
      input.programCode = createProgrammeInput.programCode;
      input.skill = skill_id;
      input.type = createProgrammeInput.type;
      input.venue = createProgrammeInput.venue || null;
      input.groupCount = createProgrammeInput.groupCount || null;
      input.conceptNote = createProgrammeInput.conceptNote;
      input.model = createProgrammeInput.model;
      
      return this.programmeRepository.save(input);
    } catch (e) {
      throw new HttpException(
        'An Error have when inserting data , please check the all required fields are filled ',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(fields: string[]) {
    const allowedRelations = [
      'category',
      'skill',
      'candidateProgramme',
      'candidateProgramme.candidate',
      'candidateProgramme.candidate.team',
      'category.settings',
      'candidateProgramme.candidatesOfGroup',
      'candidateProgramme.grade',
      'candidateProgramme.position',
    ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.programmeRepository
        .createQueryBuilder('programme')
        .leftJoinAndSelect('programme.category', 'category')
        .leftJoinAndSelect('programme.skill', 'skill')
        .leftJoinAndSelect('programme.candidateProgramme', 'candidateProgramme')
        .leftJoinAndSelect('candidateProgramme.candidate', 'candidate')
        .leftJoinAndSelect('candidate.team', 'team')
        .leftJoinAndSelect('category.settings', 'settings')
        .leftJoinAndSelect('candidateProgramme.candidatesOfGroup', 'candidatesOfGroup')
        .leftJoinAndSelect('candidateProgramme.grade', 'grade')
        .leftJoinAndSelect('candidateProgramme.position', 'position')
        .orderBy('programme.id', 'ASC');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `programme.${column}`;
          }
        }),
      );
      const programme = await queryBuilder.getMany();
      return programme;
    } catch (e) {
      console.log(e);

      throw new HttpException(
        'An Error have when finding programme ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  // find the result entered programmes

  async findResultEnteredProgrammes(fields: string[]) {
    const allowedRelations = [
      'category',
      'skill',
      'candidateProgramme',
      'candidateProgramme.candidate',
      'candidateProgramme.candidate.team',
      'category.settings',
      'candidateProgramme.candidatesOfGroup',
      'candidateProgramme.grade',
      'candidateProgramme.position',
    ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);

    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.programmeRepository
        .createQueryBuilder('programme')
        .where('programme.resultEntered = true')
        .leftJoinAndSelect('programme.category', 'category')
        .leftJoinAndSelect('programme.skill', 'skill')
        .leftJoinAndSelect('programme.candidateProgramme', 'candidateProgramme')
        .leftJoinAndSelect('candidateProgramme.candidate', 'candidate')
        .leftJoinAndSelect('candidate.team', 'team')
        .leftJoinAndSelect('category.settings', 'settings')
        .leftJoinAndSelect('candidateProgramme.candidatesOfGroup', 'candidatesOfGroup')
        .leftJoinAndSelect('candidateProgramme.grade', 'grade')
        .leftJoinAndSelect('candidateProgramme.position', 'position');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `programme.${column}`;
          }
        }),
      );
      const programme = await queryBuilder.getMany();
      return programme;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding programme ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
    
  }

  // result published programmes


  async findResultPublishedProgrammes( fields: string[]){
    const allowedRelations = [
      'category',
      'skill',
      'candidateProgramme',
      'candidateProgramme.candidate',
      'candidateProgramme.candidate.team',
      'category.settings',
      'candidateProgramme.candidatesOfGroup',
      'candidateProgramme.grade',
      'candidateProgramme.position',
    ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);

    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.programmeRepository
        .createQueryBuilder('programme')
        .where('programme.resultPublished = true')
        .leftJoinAndSelect('programme.category', 'category')
        .leftJoinAndSelect('programme.skill', 'skill')
        .leftJoinAndSelect('programme.candidateProgramme', 'candidateProgramme')
        .leftJoinAndSelect('candidateProgramme.candidate', 'candidate')
        .leftJoinAndSelect('candidate.team', 'team')
        .leftJoinAndSelect('category.settings', 'settings')
        .leftJoinAndSelect('candidateProgramme.candidatesOfGroup', 'candidatesOfGroup')
        .leftJoinAndSelect('candidateProgramme.grade', 'grade')
        .leftJoinAndSelect('candidateProgramme.position', 'position');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `programme.${column}`;
          }
        }),
      );
      const programme = await queryBuilder.getMany();
      return programme;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding programme ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }


  async findOne(id: number, fields: string[]) {
    const allowedRelations = [
      'category',
      'skill',
      'candidateProgramme',
      'candidateProgramme.candidate',
      'candidateProgramme.candidate.team',
      'category.settings',
      'candidateProgramme.candidatesOfGroup',
      'candidateProgramme.grade',
      'candidateProgramme.position',
      'judges'
    ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.programmeRepository
        .createQueryBuilder('programme')
        .where('programme.id = :id', { id })
        .leftJoinAndSelect('programme.category', 'category')
        .leftJoinAndSelect('programme.skill', 'skill')
        .leftJoinAndSelect('programme.judges', 'judges')
        .leftJoinAndSelect('programme.candidateProgramme', 'candidateProgramme')
        .leftJoinAndSelect('candidateProgramme.candidate', 'candidate')
        .leftJoinAndSelect('candidate.team', 'team')
        .leftJoinAndSelect('category.settings', 'settings')
        .leftJoinAndSelect('candidateProgramme.candidatesOfGroup', 'candidatesOfGroup')
        .leftJoinAndSelect('candidateProgramme.grade', 'grade')
        .leftJoinAndSelect('candidateProgramme.position', 'position');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `programme.${column}`;
          }
        }),
      );
      const programme = await queryBuilder.getOne();
      return programme;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding programme ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findOneByCode(programCode: string) {
    try {
      const programme = await this.programmeRepository.findOne({
        where: {
          programCode,
        },
        relations: [
          'category',
          'skill',
          'candidateProgramme',
          'category.settings',
          'candidateProgramme.candidate',
          'candidateProgramme.candidate.team',
          'candidateProgramme.candidatesOfGroup',
          'candidateProgramme.grade',
          'candidateProgramme.position',
        ],
      });

      return programme;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding programme ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findOneByCodeWithouError(programCode: string) {
    try {
      const programme = await this.programmeRepository.findOne({
        where: {
          programCode,
        },
        relations: [
          'category',
          'skill',
          'candidateProgramme',
          'category.settings',
          'candidateProgramme.candidate',
          'candidateProgramme.candidate.team',
          'candidateProgramme.candidatesOfGroup',
          'candidateProgramme.grade',
          'candidateProgramme.position',
        ],
      });

      if(!programme){
        return null;
      }

      return programme;
    } catch (e) {
      return null;
    }
  }

  // find the programme by programme code know is the programme is there

  async findOneByCodeForCheck(programCode: string) {
    
    try {
    const data =  await this.programmeRepository.createQueryBuilder('programme')
     .where('programme.programCode = :programCode', { programCode })
     .select('programme.id')
     .getOne();
     

      return data;
    } catch (e) {
      throw new HttpException('An Error have when finding programme ', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

 async findByCategories(categories: string[] , fields: string[]) {
    const allowedRelations = [
      'category',
      'skill',
    ];
    
    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.programmeRepository
        .createQueryBuilder('programme')
        .leftJoinAndSelect('programme.category', 'category')
        .where('category.name IN (:...categories)', { categories })
        .leftJoinAndSelect('programme.skill', 'skill')

        queryBuilder.select(
          fields.map(column => {
            const splitted = column.split('.');
  
            if (splitted.length > 1) {
              return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
            } else {
              return `programme.${column}`;
            }
          }),
        );
        const programme = await queryBuilder.getMany();
        return programme;
      } catch (e) {
        throw new HttpException(
          'An Error have when finding programme ',
          HttpStatus.INTERNAL_SERVER_ERROR,
          { cause: e },
        );
      }
  }

 
  async update(id: number, updateProgrammeInput: UpdateProgrammeInput, user: Credential) {

        // checking is programme exist

        const programme = await this.programmeRepository.findOneBy({ id });

        if (!programme) {
          throw new HttpException(`Cant find a programme to update`, HttpStatus.BAD_REQUEST);
        }

    //  checking is category exist

    const category_id = await this.categoryService.findOneByName(updateProgrammeInput.category);

    if (!category_id) {
      throw new HttpException(
        `Cant find a category named ${updateProgrammeInput.category}  ,ie: check on Category of ${updateProgrammeInput.name}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // authenticating the user have permission to update the category

    this.CredentialService.checkPermissionOnCategories(user, category_id.name);


    //  checking is skill exist

    const IS_SKILL_REQUIRED = (await this.detailsService.findIt()).isSkillHave
    

    //  checking is skill exist

    let skill_id = await this.skillService.findOneByName(updateProgrammeInput.skill, ['id']);

    if (IS_SKILL_REQUIRED) {
      if (!updateProgrammeInput.skill) {
        throw new HttpException(
          `Skill is required ,ie: check on Skill of ${updateProgrammeInput.name}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!skill_id) {
        throw new HttpException(
          `Cant find a skill named ${updateProgrammeInput.skill} ,ie: check on skill of ${updateProgrammeInput.name}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      skill_id = null;
    }

    try {
      // creating a instance of Programme

      // updating Value to Programme
      programme.candidateCount = updateProgrammeInput.candidateCount;
      programme.category = category_id;
      programme.duration = updateProgrammeInput.duration;
      programme.mode = updateProgrammeInput.mode;
      programme.name = updateProgrammeInput.name;
      programme.programCode = updateProgrammeInput.programCode;
      programme.skill = skill_id;
      programme.type = updateProgrammeInput.type;
      programme.venue = updateProgrammeInput.venue || null;
      programme.groupCount = updateProgrammeInput.groupCount;
      programme.conceptNote = updateProgrammeInput.conceptNote;
      programme.model = updateProgrammeInput.model;

      return this.programmeRepository.save(programme)
    } catch {
      throw new HttpException(
        'An Error have when updating programme , please check the all required fields are filled ',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number, user: Credential) {
    const programme = await this.findOne(id, ['id','category' , 'category.name']);

    if (!programme) {
      throw new HttpException(`Cant find a programme to delete`, HttpStatus.BAD_REQUEST);
    }

    // authenticating the user have permission to remove the category

    console.log(programme);
    

    this.CredentialService.checkPermissionOnCategories(user, programme.category.name);

    try {
      return this.programmeRepository.delete(id);
    } catch (e) {
      throw new HttpException(
        'An Error have when deleting programme ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async setManySchedule(scheduleData: any, user: Credential) {
    const allData: {
      code: string;
      date: Date;
      venue: number;
      programme: Programme;
    }[] = [];

    const UploadedProgrammes : Programme[] = []

    console.log(scheduleData);
    

    for (let index = 0; index < scheduleData.inputs.length; index++) {
      const data: CreateSchedule = scheduleData.inputs[index];

      const { code, date, venue } = data;

      // checking the code is correct
      const programme: Programme = await this.findOneByCode(code);

      const category_id = await this.categoryService.findOneByName(programme?.category?.name);

      if (!category_id) {
        throw new HttpException(
          `Cant find a category named ${programme?.category?.name}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // authenticating the user have permission to update the category

      this.CredentialService.checkPermissionOnCategories(user, category_id.name);

      if (!programme) {
        throw new HttpException(`Cant find a programme with code ${code}`, HttpStatus.BAD_REQUEST);
      }

      // validating the date

      const isDate = isDateValid(date);

      if (!isDate) {
        throw new HttpException(`Date is not valid`, HttpStatus.BAD_REQUEST);
      }

      // checking is venue entered it is not essential but if entered it must be a number

      if (venue) {
        if (isNaN(venue)) {
          throw new HttpException(`Venue must be a number`, HttpStatus.BAD_REQUEST);
        }
      }
      allData.push({
        code: code ,
        date: date ,
        venue: venue,
        programme: programme
      })
    }

    

    try {
      if (allData.length !== scheduleData.inputs.length) {
        throw new HttpException(
          `Some programmes are not eligible to set schedule`,
          HttpStatus.BAD_REQUEST,
        );
      }

      for (let index = 0; index < allData.length; index++) {
        const data = allData[index];

        const { date, venue, programme } = data;

        // updating the programme by adding date and venue

        programme.date = date;
        programme.venue = venue;

        console.log("pushed");
        const upload = await this.programmeRepository.save(programme);

        UploadedProgrammes.push(upload)


      }

      return UploadedProgrammes;
      
    } catch (e) {
      throw new HttpException(
        'An Error have when updating programme ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async setSchedule(scheduleData: CreateSchedule, user: Credential) {
    const { code, date, venue } = scheduleData;

    // checking the code is correct
    const programme: Programme = await this.findOneByCode(code);

    if (!programme) {
      throw new HttpException(`Cant find a programme with code ${code}`, HttpStatus.BAD_REQUEST);
    }

    const category_id = await this.categoryService.findOneByName(programme?.category?.name);

    if (!category_id) {
      throw new HttpException(
        `Cant find a category named ${programme?.category?.name}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // authenticating the user have permission to update the category
    const categoryExists = user.categories?.some(category => category.name === category_id.name);

    if (!categoryExists) {
      throw new HttpException(
        `You dont have permission to access the category ${category_id.name} `,
        HttpStatus.UNAUTHORIZED,
      );
    }

    // validating the date

    const isDate = isDateValid(date);

    if (!isDate) {
      throw new HttpException(`Date is not valid`, HttpStatus.BAD_REQUEST);
    }

    // checking is venue entered it is not essential but if entered it must be a number

    if (venue) {
      if (isNaN(venue)) {
        throw new HttpException(`Venue must be a number`, HttpStatus.BAD_REQUEST);
      }
    }

    // updating the programme by adding date and venue

    programme.date = date;
    programme.venue = venue;

    return this.programmeRepository.save(programme);
  }

  async removeSchedule(programCode: string, user: Credential) {
    // checking the code is correct
    const programme: Programme = await this.findOneByCodeForCheck(programCode);

    if (!programme) {
      throw new HttpException(
        `Cant find a programme with code ${programCode}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    //  authenticating the user have permission to update the category

    this.CredentialService.checkPermissionOnCategories(user, programme.category.name);

    try {
      return this.programmeRepository.query(
        `UPDATE programme SET date = null , venue = null  WHERE program_code = "${programCode}" `,
      );
    } catch (e) {
      throw new HttpException(
        'An Error have when deleting data ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async enterResult(programCode: string) {
    // checking the code is correct
    const programme: Programme = await this.findOneByCodeForCheck(programCode);

    if (!programme) {
      throw new HttpException(
        `Cant find a programme with code ${programCode}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return this.programmeRepository.query(
        `UPDATE programme SET resultEntered = true WHERE programCode = "${programCode}" `,
      );
    } catch (e) {
      throw new HttpException(
        'An Error have when updating programme ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async removeResult(programCode: string) {
    // checking the code is correct
    const programme: Programme = await this.findOneByCodeForCheck(programCode);

    if (!programme) {
      throw new HttpException(
        `Cant find a programme with code ${programCode}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return this.programmeRepository.query(
        `UPDATE programme SET resultEntered = false WHERE programCode = "${programCode}" `,
      );
    } catch (e) {
      throw new HttpException(
        'An Error have when deleting data ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async publishResult(programCode: string) {
    // checking the code is correct
    const programme: Programme = await this.findOneByCodeForCheck(programCode);

    if (!programme) {
      throw new HttpException(
        `Cant find a programme with code ${programCode}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return this.programmeRepository.query(
        `UPDATE programme SET resultPublished = true WHERE programCode = "${programCode}" `,
      );
    } catch (e) {
      throw new HttpException(
        'An Error have when updating programme ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async removePublishedResult(programCode: string) {
    // checking the code is correct
    const programme: Programme = await this.findOneByCodeForCheck(programCode, );

    if (!programme) {
      throw new HttpException(
        `Cant find a programme with code ${programCode}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return this.programmeRepository.query(
        `UPDATE programme SET resultPublished = false WHERE programCode = "${programCode}"`,
      );
    } catch (e) {
      throw new HttpException(
        'An Error have when deleting data ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async setTotalMarks(programCode: string, totalMark: number, isFromJudge: boolean = false) {
    // checking the code is correct
    const programme: Programme = await this.findOneByCodeForCheck(programCode);

    if (!programme) {
      throw new HttpException(
        `Cant find a programme with code ${programCode}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    let totalMarks: number;

    if (isFromJudge) {
      totalMarks = programme.totalMark + totalMark;
    } else {
      totalMarks = totalMark;
    }
    try {
      return this.programmeRepository.save({
        ...programme,
        totalMark: totalMarks,
      });
    } catch (e) {
      throw new HttpException(
        'An Error have when updating total marks of the programme',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e, description: e.message },
      );
    }
  }

  // change the value of anyIssue to true or false
  async setAnyIssue(programCode: string, anyIssue: boolean) {
    // checking the code is correct
    const programme: Programme = await this.findOneByCodeForCheck(programCode);

    if (!programme) {
      throw new HttpException(
        `Cant find a programme with code ${programCode}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return this.programmeRepository.query(
        `UPDATE programme SET anyIssue = ${anyIssue} WHERE programCode = "${programCode}" `,
      );
    } catch (e) {
      throw new HttpException(
        'An Error have when updating anyIssue of the programme',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  // check Programme is ready to publish
}

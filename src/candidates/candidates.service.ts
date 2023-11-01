import { HttpException, HttpStatus, Injectable, UsePipes, ValidationPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryService } from 'src/category/category.service';
import { SectionsService } from 'src/sections/sections.service';
import { TeamsService } from 'src/teams/teams.service';
import { In, Repository } from 'typeorm';
import { CreateCandidateInput } from './dto/create-candidate.input';
import { UpdateCandidateInput } from './dto/update-candidate.input';
import { Candidate } from './entities/candidate.entity';
import { Gender } from './entities/candidate.entity';
import { Category } from 'src/category/entities/category.entity';
import { Credential } from 'src/credentials/entities/credential.entity';
import { CandidateProgrammeService } from 'src/candidate-programme/candidate-programme.service';
import { Team } from 'src/teams/entities/team.entity';
import { CreateInput } from './dto/create-input.dto';
import { CredentialsService } from 'src/credentials/credentials.service';
import { fieldsIdChecker, fieldsValidator } from 'src/utils/util';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';
import { driveConfig } from 'src/utils/googleApi.auth';
import { Model, Type } from 'src/programmes/entities/programme.entity';
import { CategorySettings } from 'src/category-settings/entities/category-setting.entity';
import { CategorySettingsService } from 'src/category-settings/category-settings.service';
// import { drive } from 'src/utils/googleApi.auth';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate) private candidateRepository: Repository<Candidate>,
    private teamService: TeamsService,
    private categoryService: CategoryService,
    private sectionService: SectionsService,
    private candidateProgrammeService: CandidateProgrammeService,
    private credentialService: CredentialsService,
    private categorySettingsService: CategorySettingsService,
  ) { }

  //  To create many candidates at a time , Normally using on Excel file upload

  async createMany(createCandidateInputArray: CreateInput, user: Credential) {
    // the final data variable
    var FinalData: Candidate[] = [];
    var allData: {
      adno: number;
      category: Category;
      chestNO: string;
      class: string;
      name: string;
      team: Team;
    }[] = [];

    // Iterate the values and taking all the individuals

    for (let index = 0; index < createCandidateInputArray.inputs.length; index++) {
      const createCandidateInput = createCandidateInputArray.inputs[index];

      //  checking is category exist

      const category_id = await this.categoryService.findOneByName(createCandidateInput.category);

      if (!category_id) {
        throw new HttpException(
          `Cant find a category named ${createCandidateInput.category}  ,ie: check on Category of ${createCandidateInput.name}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // authenticating the user have permission to create the candidates

      this.credentialService.checkPermissionOnCategories(user, category_id.name);

      //  checking is team exist

      const team_id = await this.teamService.findOneByName(createCandidateInput.team, ['id']);

      if (!team_id) {
        throw new HttpException(
          `Cant find a team named ${createCandidateInput.team} ,ie: check on Team of ${createCandidateInput.name}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // checking is chessNo already exist
      const candidate = await this.candidateRepository.findOne({
        where: {
          chestNO: createCandidateInput.chestNO,
        },
      });

      if (candidate) {
        throw new HttpException(
          `Candidate with chess no ${createCandidateInput.chestNO} already exists ,ie: check on chessNo of ${createCandidateInput.name}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // checking is chestNo already exist in the array

      const chestNoExists = allData.some(data => data.chestNO === createCandidateInput.chestNO);

      if (chestNoExists) {
        throw new HttpException(
          `Multiple candidates have same chest no ${createCandidateInput.chestNO} ,ie: check on chestNo of ${createCandidateInput.name}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      allData.push({
        adno: createCandidateInput.adno,
        category: category_id,
        chestNO: createCandidateInput.chestNO,
        class: createCandidateInput.class,
        name: createCandidateInput.name,
        team: team_id,
      });
    }

    // looping the values

    try {
      // checking all candidates are checked

      if (allData.length !== createCandidateInputArray.inputs.length) {
        throw new HttpException(
          `Some candidates are not eligible to create ,ie: check on candidates`,
          HttpStatus.BAD_REQUEST,
        );
      }

      for (let index = 0; index < allData.length; index++) {
        const data = allData[index];

        // creating a instance of Candidate
        const input = new Candidate();

        // updating Value to candidate
        input.adno = data.adno;
        input.category = data.category;
        input.chestNO = data.chestNO;
        input.class = data.class;
        input.name = data.name;
        input.team = data.team;

        let saveData = await this.candidateRepository.save(input);

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

  // create a single candidate
  async create(createCandidateInput: CreateCandidateInput, user: Credential): Promise<Candidate> {
    //  checking is category exist

    const category_id = await this.categoryService.findOneByName(createCandidateInput.category);

    if (!category_id) {
      throw new HttpException(
        `Cant find a category named ${createCandidateInput.category}  ,ie: check on Category of ${createCandidateInput.name}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // authenticating the user have permission to update the category

    this.credentialService.checkPermissionOnCategories(user, category_id.name);

    //  checking is team exist

    const team_id = await this.teamService.findOneByName(createCandidateInput.team, ['id']);

    if (!team_id) {
      throw new HttpException(
        `Cant find a team named ${createCandidateInput.team} ,ie: check on Team of ${createCandidateInput.name}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // checking is chessNo already exist
    const candidate = await this.candidateRepository.findOne({
      where: {
        chestNO: createCandidateInput.chestNO,
      },
    });

    if (candidate) {
      throw new HttpException(
        `Candidate with chess no ${createCandidateInput.chestNO} already exists ,ie: check on chessNo of ${createCandidateInput.name}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // creating a instance of Candidate
      const input = new Candidate();

      // updating Value to candidate
      input.adno = createCandidateInput.adno;
      input.category = category_id;
      input.chestNO = createCandidateInput.chestNO;
      input.class = createCandidateInput.class;
      input.name = createCandidateInput.name;
      input.team = team_id;

      return this.candidateRepository.save(input);
    } catch (e) {
      throw new HttpException(
        'An Error have when inserting data , please check the all required fields are filled ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findAll(fields: string[]) {
    const allowedRelations = [
      'category',
      'team',
      'candidateProgrammes',
      'candidateProgrammes.programme',

    ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.candidateRepository
        .createQueryBuilder('candidate')
        .leftJoinAndSelect('candidate.category', 'category')
        .leftJoinAndSelect('candidate.team', 'team')
        .leftJoinAndSelect('candidate.candidateProgrammes', 'candidateProgrammes')
        .leftJoinAndSelect('candidateProgrammes.programme', 'programme');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `candidate.${column}`;
          }
        }),
      );
      const candidate = await queryBuilder.getMany();
      return candidate;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding candidate ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findByCategories(categories: string[], fields: string[]) {
    const allowedRelations = ['category', 'team'];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.candidateRepository
        .createQueryBuilder('candidate')
        .leftJoinAndSelect('candidate.category', 'category')
        .where('category.name IN (:...categories)', { categories })
        .leftJoinAndSelect('candidate.team', 'team');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `candidate.${column}`;
          }
        }),
      );
      const candidate = await queryBuilder.getMany();
      return candidate;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding candidate ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  // find candidates by category name and team name

  async findByCategoryNamesAndTeamName(categories: string[], teamName: string, fields: string[]) {

    const allowedRelations = ['category', 'team'];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);
    try {
      const queryBuilder = this.candidateRepository
        .createQueryBuilder('candidate')
        .where('candidate.category.name IN (:...categories)', { categories })
        .andWhere('candidate.team.name = :teamName', { teamName })
        .leftJoinAndSelect('candidate.category', 'category')
        .leftJoinAndSelect('candidate.team', 'team')

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `candidate.${column}`;
          }
        }),
      );
      const candidate = await queryBuilder.getMany();
      return candidate;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding candidate ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }


  async findOne(id: number, fields: string[]) {
    const allowedRelations = [
      'category',
      'team',
      'candidateProgrammes',
      'candidateProgrammes.programme',
      'candidateProgrammes.position',
      'candidateProgrammes.grade',
    ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);
    try {
      const queryBuilder = this.candidateRepository
        .createQueryBuilder('candidate')
        .where('candidate.id = :id', { id })
        .leftJoinAndSelect('candidate.category', 'category')
        .leftJoinAndSelect('candidate.team', 'team')
        .leftJoinAndSelect('candidate.candidateProgrammes', 'candidateProgrammes')
        .leftJoinAndSelect('candidateProgrammes.programme', 'programme')
        .leftJoinAndSelect('candidateProgrammes.position', 'position')
        .leftJoinAndSelect('candidateProgrammes.grade', 'grade');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `candidate.${column}`;
          }
        }),
      );
      const candidate = await queryBuilder.getOne();
      return candidate;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding candidate ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findOneByChestNo(chestNO: string) {
    try {
      const candidate = await this.candidateRepository.findOne({
        where: {
          chestNO,
        },
        relations: ['category', 'team', 'candidateProgrammes'],
      });

      if (!candidate) {
        throw new HttpException(
          `Cant find candidate with chest no ${chestNO} `,
          HttpStatus.BAD_REQUEST,
        );
      }

      return candidate;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR, { cause: e });
    }
  }

  async findOneByChestNoWithoutError(chestNO: string) {
    try {
      const candidate = await this.candidateRepository.findOne({
        where: {
          chestNO,
        },
        relations: ['category', 'team', 'candidateProgrammes'],
      });

      if (!candidate) {
        return null;
      }

      return candidate;
    } catch (e) {
      return null;
    }
  }

  async findOneByChesNoByFields(chestNO: string, fields: string[]) {
    const allowedRelations = ['category', 'team', 'candidateProgrammes'];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);
    try {
      const queryBuilder = this.candidateRepository
        .createQueryBuilder('candidate')
        .where('candidate.chestNO = :chestNO', { chestNO })
        .leftJoinAndSelect('candidate.category', 'category')
        .leftJoinAndSelect('candidate.team', 'team')
        .leftJoinAndSelect('candidate.candidateProgrammes', 'candidateProgrammes')
        .leftJoinAndSelect('candidateProgrammes.programme', 'programme');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `candidate.${column}`;
          }
        }),
      );
      const candidate = await queryBuilder.getOne();
      return candidate;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding candidate ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  // check is candidate in a programme

  async findOneByChestNoAndProgrammeId(chestNO: string, programmeCode: string) {
    // checking is candidate exist

    const candidate = await this.candidateRepository.findOne({
      where: {
        chestNO,
      },
      relations: ['candidateProgrammes'],
    });

    if (!candidate) {
      throw new HttpException(`Cant find candidate with name ${chestNO} `, HttpStatus.BAD_REQUEST);
    }

    // checking is candidate in programme

    const candidateProgramme = candidate.candidateProgrammes?.find(
      candidateProgramme => candidateProgramme.programme?.programCode === programmeCode,
    );

    return candidateProgramme;
  }


  async findOverallToppers(fields: string[]) {
    const allowedRelations = [
      'category',
      'team',
      'candidateProgrammes',
      'candidateProgrammes.programme',

    ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.candidateRepository
        .createQueryBuilder('candidate')
        .leftJoinAndSelect('candidate.category', 'category')
        .leftJoinAndSelect('candidate.team', 'team')
        .leftJoinAndSelect('candidate.candidateProgrammes', 'candidateProgrammes')
        .leftJoinAndSelect('candidateProgrammes.programme', 'programme')
        .orderBy('candidate.individualPoint', 'ASC')

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `candidate.${column}`;
          }
        }),
      );
      const candidates: Candidate[] = await queryBuilder.getMany()


      // sort the candidates by individual point
      const candidatePromises = candidates.map(async (candidate: Candidate) => {
        const total: CategorySettings = await this.categorySettingsService.findOne(candidate.category.id, ['id', 'maxSingle']);
        console.log(total);

        return { candidate, total };
      });

      Promise.all(candidatePromises)
        .then((candidateTotals) => {
          // Sort the candidates based on the totals
          const sortedCandidates = candidateTotals.sort((a, b) => {
            const aMax = a.total.maxSingle * 8;
            const bMax = b.total.maxSingle * 8;
            const aTotal = a.candidate.individualPoint ? a.candidate.individualPoint : 0 / aMax * 100;
            const bTotal = b.candidate.individualPoint ? b.candidate.individualPoint : 0 / bMax * 100;

            if (a.candidate.category.name == 'THANAWIYYA' || 'ALIYA') {
              return bTotal - aTotal;
            }
            return bTotal - aTotal;
          });

          // Now you have sortedCandidates as an array of objects with candidate and total properties
          console.log(sortedCandidates);
        })
        .catch((error) => {
          // Handle any errors that occurred during data retrieval or sorting
          console.error(error);
        });




      return candidates;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding candidate ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  // category based toppers

  async getCategoryBasedToppers() {

    // get all candidates and their candidate programmes then add the points in candiate programmes to candiate and sort them by points and return the top 5
    // candidates must be category based

    // get all candidates

    const candidates = await this.candidateRepository.find({
      relations: ['candidateProgrammes', 'category' , 'candidateProgrammes.programme' , 'team'],
    });

    const categories = await this.categoryService.findAll(['id', 'name']);

    const pointedCandidates = candidates.map((candidate , i) => {
      let total = 0;
      let totalSports = 0;
      candidate.candidateProgrammes.forEach(candidateProgramme => {

        if(candidateProgramme.programme?.model === Model.Arts && candidateProgramme.programme?.type === Type.SINGLE){
          total = total + candidateProgramme.point;
        }

        if(candidateProgramme.programme?.model === Model.Sports && candidateProgramme.programme?.type === Type.SINGLE){
          totalSports = totalSports + candidateProgramme.point;
        }

      });


      return {
        ...candidate,
        individualPoint: total,
        individualSportsPoint: totalSports,
      }


    }
    );

    // setting the category based toppers

    const candaidatedByCategory = categories.map(category => {
      const candidates = pointedCandidates.filter(candidate => candidate.category.name === category.name);

      const sortedCandidates = candidates.slice().sort((a, b) => b.individualPoint - a.individualPoint);
      const sortedSportsCandidates = candidates.slice().sort((a, b) => b.individualSportsPoint - a.individualSportsPoint);

      return {
        ...category,
       candidates: [...sortedCandidates.slice(0, 5) , ...sortedSportsCandidates.slice(0, 5)]
      }
    }
    );

    // log first 5 candidates
    // console.log(pointedCandidates.sort((a, b) => b.total - a.total).slice(0, 5));
    

    return candaidatedByCategory;
  }


  async getPublishedCategoryBasedToppers() {

    // get all candidates and their candidate programmes then add the points in candiate programmes to candiate and sort them by points and return the top 5
    // candidates must be category based

    // get all candidates

    const candidates = await this.candidateRepository.find({
      relations: ['candidateProgrammes', 'category' , 'candidateProgrammes.programme' , 'team'],
    });

    const categories = await this.categoryService.findAll(['id', 'name']);

    const pointedCandidates = candidates.map((candidate , i) => {
      let total = 0;
      let totalSports = 0;
      candidate.candidateProgrammes.forEach(candidateProgramme => {

        if(candidateProgramme.programme?.model === Model.Arts && candidateProgramme.programme?.type === Type.SINGLE && candidateProgramme.programme?.resultPublished){
          total = total + candidateProgramme.point;
        }

        if(candidateProgramme.programme?.model === Model.Sports && candidateProgramme.programme?.type === Type.SINGLE && candidateProgramme.programme?.resultPublished){
          totalSports = totalSports + candidateProgramme.point;
        }

      });


      return {
        ...candidate,
        individualPoint: total,
        individualSportsPoint: totalSports,
      }


    }
    );

    // setting the category based toppers

    const candaidatedByCategory = categories.map(category => {
      const candidates = pointedCandidates.filter(candidate => candidate.category.name === category.name);

      const sortedCandidates = candidates.slice().sort((a, b) => b.individualPoint - a.individualPoint);
      const sortedSportsCandidates = candidates.slice().sort((a, b) => b.individualSportsPoint - a.individualSportsPoint);

      return {
        ...category,
       candidates: [...sortedCandidates.slice(0, 5) , ...sortedSportsCandidates.slice(0, 5)]
      }
    }
    );

    // log first 5 candidates
    // console.log(pointedCandidates.sort((a, b) => b.total - a.total).slice(0, 5));
    

    return candaidatedByCategory;
  }

  // Update data

  async update(id: number, updateCandidateInput: UpdateCandidateInput, user: Credential) {
    // --------------------
    // checking .........
    // --------------------
    //  checking is category exist

    const category_id = await this.categoryService.findOneByName(updateCandidateInput.category);

    if (!category_id) {
      throw new HttpException(
        `Cant find a category named ${updateCandidateInput.category}  ,ie: check on Category of ${updateCandidateInput.name}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // authenticating the user have permission to update the category

    this.credentialService.checkPermissionOnCategories(user, category_id.name);

    // checking is candidate exist

    const candidate = await this.candidateRepository.findOneBy({ id });

    if (!candidate) {
      throw new HttpException(
        `Cant find a candidate named ${updateCandidateInput.name}}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    //  checking is team exist

    const team_id = await this.teamService.findOneByName(updateCandidateInput.team, ['id']);

    if (!team_id) {
      throw new HttpException(
        `Cant find a team named ${updateCandidateInput.team} ,ie: check on Team of ${updateCandidateInput.name}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {

      // updating Value to candidate
      candidate.adno = updateCandidateInput.adno;
      candidate.category = category_id;
      candidate.chestNO = updateCandidateInput.chestNO;
      candidate.class = updateCandidateInput.class;
      candidate.name = updateCandidateInput.name;
      candidate.team = team_id;

      return this.candidateRepository.save(candidate)
    } catch (e) {
      throw new HttpException(
        'An Error have when updating data , please check the all required fields are filled ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async remove(id: number, user: Credential) {
    // --------------------
    // checking .........
    // --------------------

    // checking is candidate exist

    const candidate = await this.findOne(id, ['category.name']);

    const category_id = await this.categoryService.findOneByName(candidate?.category?.name);

    if (!category_id) {
      throw new HttpException(
        `Cant find a category named ${candidate?.category?.name}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // authenticating the user have permission to update the category

    this.credentialService.checkPermissionOnCategories(user, category_id.name);

    if (!candidate) {
      throw new HttpException(`Cant find a candidate to delete`, HttpStatus.BAD_REQUEST);
    }

    try {
      return this.candidateRepository.delete(id);
    } catch (e) {
      throw new HttpException(
        'An Error have when deleting data ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  // add individual or group point to candidate

  async addPoint(id: number, indPoint: number = 0, groupPoint: number = 0, model: Model) {
    const candidate = await this.candidateRepository.findOneBy({ id });

    if (!candidate) {
      throw new HttpException(`Cant find a candidate to add point`, HttpStatus.BAD_REQUEST);
    }

    let individualPoint = candidate.individualPoint || 0;
    let groupGeneralPoint = candidate.groupPoint || 0;
    let groupSportsPoint = candidate.individualSportsPoint || 0;
    let individualSportsPoint = candidate.groupSportsPoint || 0;

    if (model === Model.Arts) {
      individualPoint = individualPoint + indPoint;
      groupGeneralPoint = groupGeneralPoint + groupPoint;
    } else if (model === Model.Sports) {
      individualSportsPoint = individualSportsPoint + indPoint;
      groupSportsPoint = groupSportsPoint + groupPoint;
    }

    try {
      return this.candidateRepository.save({
        ...candidate,
        individualPoint,
        groupPoint: groupGeneralPoint,
        individualSportsPoint,
        groupSportsPoint,
      });
    } catch (err) {
      throw new HttpException(
        'An Error have when updating candidate point ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: err },
      );
    }
  }

  // image upload to google drive and save id to candidate

  async uploadFiles(files: Express.Multer.File[]) {

    for (let index = 0; index < files.length; index++) {
      const file = files[index];

      const chestNo = file.originalname.split('.')[0]



      await this.uploadFile(chestNo, file.buffer, file.originalname, file.mimetype);


      // await this.uploadFile(chestNo, file.buffer, file.originalname, file.mimetype);
    }

    return 'done';
  }

  async uploadFile(chestNo: string, filePath: Buffer, fileName: string, mimeType: string) {

    const candidate = await this.candidateChecker(chestNo, mimeType)

    // check the file is image
    const buffer = Buffer.from(filePath);

    // change the buffer to readable stream
    const readableStream = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      },
    });

    // Get the file extension.
    const fileExtension = fileName.split('.')[1];

    // get the folder id
    const folderId = process.env.DRIVE_CANDIDATES_FOLDER_ID;

    try {
      // driveConfig
      const drive = driveConfig();

      const response = await drive.files.create({
        requestBody: {
          name: `${chestNo}.${fileExtension}`, //file name
          mimeType,
          parents: folderId ? [folderId] : [],
        },
        media: {
          mimeType,
          body: readableStream,
        },
      });
      // report the response from the request

      // save image id to candidate

      candidate.imageId = response.data.id;

      return this.candidateRepository.save(candidate);
    } catch (error) {
      //report the error message
      throw new HttpException(
        `Error on google drive upload , check the image of ${chestNo}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async candidateChecker(chestNo, mimeType) {
    const candidate = await this.findOneByChesNoByFields(chestNo, ['id']);


    if (!candidate) {
      throw new HttpException(
        `can't find candidate with chest no ${chestNo}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // check the file is image
    if (!mimeType.includes('image')) {
      throw new HttpException(`File is not an image`, HttpStatus.BAD_REQUEST);
    }

    return candidate;
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateJudgeInput } from './dto/create-judge.input';
import { UpdateJudgeInput } from './dto/update-judge.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Judge } from './entities/judge.entity';
import { ProgrammesService } from 'src/programmes/programmes.service';
import { LoginService } from 'src/credentials/login/login.service';
import { UploadMarkInput } from './dto/upload-mark.input';
import { CandidatesService } from 'src/candidates/candidates.service';
import { CandidateProgrammeService } from 'src/candidate-programme/candidate-programme.service';
import { Candidate } from 'src/candidates/entities/candidate.entity';
import { CandidateProgramme } from 'src/candidate-programme/entities/candidate-programme.entity';
import { ResultGenService } from 'src/candidate-programme/result-gen.service';
import { AddResult } from 'src/candidate-programme/dto/add-result.dto';
import { Programme } from 'src/programmes/entities/programme.entity';
import { arrayInput } from 'src/candidate-programme/dto/array-input.dto';
import { CredentialsService } from 'src/credentials/credentials.service';
import { Credential } from 'src/credentials/entities/credential.entity';
import { fieldsIdChecker, fieldsValidator } from 'src/utils/util';

@Injectable()
export class JudgeService {
  constructor(
    @InjectRepository(Judge)
    private judgeRepository: Repository<Judge>,
    private readonly programmesService: ProgrammesService,
    private readonly LoginService: LoginService,
    private readonly resultGenService: ResultGenService,
    private readonly credentialsService: CredentialsService,
  ) {}

  async create(createJudgeInput: CreateJudgeInput, user: Credential) {
    // create a new judge
    const { username, password, judgeName, programmeCode } = createJudgeInput;

    // check if username already exists
    const isAlreadyExist = await this.judgeRepository.findOneBy({ username });

    if (isAlreadyExist) {
      throw new HttpException('Username already exists', HttpStatus.BAD_REQUEST);
    }

    // check is judgeName is correct format
    const regex = new RegExp(/^judge[1-7]$/);

    if (!regex.test(judgeName)) {
      throw new HttpException('Judge name is not in correct format', HttpStatus.BAD_REQUEST);
    }

    // checking is programme exist
    const programmeId = await this.programmesService.findOneByCode(programmeCode);

    if (!programmeId) {
      throw new HttpException('Programme does not exist', HttpStatus.BAD_REQUEST);
    }

    // checking is user have permission on this category

    await this.credentialsService.checkPermissionOnCategories(user, programmeId.category.name);

    // hash password
    const hashedPassword = await this.LoginService.hashPassword(password);

    // create new judge
    try {
      const newJudge = this.judgeRepository.create({
        username,
        password: hashedPassword,
        judgeName,
        programme: programmeId,
      });
      await this.judgeRepository.save(newJudge);
      return newJudge;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(fields: string[]) {
    const allowedRelations = ['programme'];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.judgeRepository
        .createQueryBuilder('judge')
        .leftJoinAndSelect('judge.programme', 'programme')
        .orderBy('judge.id', 'ASC');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `judge.${column}`;
          }
        }),
      );
      const judge = await queryBuilder.getMany();
      return judge;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding judge ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findOne(id: number, fields: string[]) {
    const allowedRelations = ['programme'];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.judgeRepository
        .createQueryBuilder('judge')
        .where('judge.id = :id', { id })
        .leftJoinAndSelect('judge.programme', 'programme')
        .orderBy('judge.id', 'ASC');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `judge.${column}`;
          }
        }),
      );
      const judge = await queryBuilder.getOne();
      return judge;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding judge ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

async findOneByUsername(username: string, fields: string[]) {
    const allowedRelations = ['programme'];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.judgeRepository
        .createQueryBuilder('judge')
        .where('judge.username = :username', { username })
        .leftJoinAndSelect('judge.programme', 'programme')
        .orderBy('judge.id', 'ASC');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `judge.${column}`;
          }
        }),
      );
      const judge = await queryBuilder.getOne();
      return judge;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding judge ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }
    
  async update(id: number, updateJudgeInput: UpdateJudgeInput, user: Credential) {
    const { username, password, judgeName, programmeCode } = updateJudgeInput;

    const judge = await this.findOne(id, ['id']);

    // check if username already exists
    const isAlreadyExist = await this.judgeRepository.findOneBy({ username });

    if (isAlreadyExist) {
      throw new HttpException('Username already exists', HttpStatus.BAD_REQUEST);
    }

    // checking is programme exist

    const programmeId = await this.programmesService.findOneByCode(programmeCode);

    if (!programmeId) {
      throw new HttpException('Programme does not exist', HttpStatus.BAD_REQUEST);
    }

    // checking is user have permission on this category

    await this.credentialsService.checkPermissionOnCategories(user, programmeId.category.name);

    // hash password

    const hashedPassword = await this.LoginService.hashPassword(password);

    // update judge
    Object.assign(judge, {
      username,
      password: hashedPassword,
      judgeName,
      programme: programmeId,
    });

    try {
      const updatedJudge = this.judgeRepository.save(judge)
      return updatedJudge;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    // check the judge exist

    const judge = await this.judgeRepository.findOneBy({ id });

    if (!judge) {
      throw new HttpException('Judge does not exist', HttpStatus.BAD_REQUEST);
    }

    try {
      const deletedJudge = this.judgeRepository.delete(id);
      return deletedJudge;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async judgeLogin( username : string , password : string){

    // find the judge by username
    const judge = await this.findOneByUsername(username , ['id' , 'username' , 'password' , 'programme' , 'programme.id' , 'programme.name' , 'programme.programCode'  ])

    if(!judge){
      throw new HttpException('Invalid Username', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    const comparedPassword = await this.LoginService.comparePassword(password , judge.password)

    if(!comparedPassword){
      throw new HttpException('Invalid Password', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return judge
  }
  
  async uploadMarkByJudge(
    // DO FIRST THE DTO SETTING OF CANDIDATE AND PROGRAMME EXCEL UPLOAD
    judgeId: number,
    programCode: string,
    uploadMarkByJudgeInput: arrayInput,
  ) {
    // check if judge exist

    const judge: Judge = await this.findOne(judgeId, [
      'programme.name',
      'judgeName',
      'programme.id',
    ]);

    if (!judge) {
      throw new HttpException('Judge does not exist', HttpStatus.BAD_REQUEST);
    }

    // check if programme exist

    const programme: Programme = await this.programmesService.findOneByCode(programCode);

    if (!programme) {
      throw new HttpException('Programme does not exist', HttpStatus.BAD_REQUEST);
    }

    // check the judge is assigned to the programme

    const isAssigned = judge.programme.id === programme.id;

    if (!isAssigned) {
      throw new HttpException('You no have access to this programme', HttpStatus.BAD_REQUEST);
    }

    // Verify the result
    await this.resultGenService.verifyResult(uploadMarkByJudgeInput.inputs, programCode);

    try {
      const UpdatedCandidateProgramme = await this.resultGenService.judgeResultCheck(
        uploadMarkByJudgeInput.inputs,
        programme.candidateProgramme,
        judge.judgeName,
      );
      if (!UpdatedCandidateProgramme) {
        throw new HttpException("can't add mark to candidates", HttpStatus.BAD_REQUEST);
      }

      this.remove(judgeId);

      return 'Mark added successfully';
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

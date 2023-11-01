import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSubstituteInput } from './dto/create-substitute.input';
import { UpdateSubstituteInput } from './dto/update-substitute.input';
import { ProgrammesService } from 'src/programmes/programmes.service';
import { CandidatesService } from 'src/candidates/candidates.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Substitute } from './entities/substitute.entity';
import { Repository } from 'typeorm';
import { CandidateProgrammeService } from 'src/candidate-programme/candidate-programme.service';
import { Credential } from 'src/credentials/entities/credential.entity';
import { Type } from 'src/programmes/entities/programme.entity';
import { CandidateProgramme } from 'src/candidate-programme/entities/candidate-programme.entity';
import { CredentialsService } from 'src/credentials/credentials.service';
import { fieldsIdChecker, fieldsValidator } from 'src/utils/util';
var firebase = require('firebase/app');
var firebasedb = require('firebase/database');

@Injectable()
export class SubstituteService {
  constructor(
    @InjectRepository(Substitute)
    private substituteRepository: Repository<Substitute>,
    private programmesService: ProgrammesService,
    private candidatesService: CandidatesService,
    private candidateProgrammeService: CandidateProgrammeService,
    private credentialService: CredentialsService,
  ) {}

  async create(createSubstituteInput: CreateSubstituteInput, user: Credential) {
    const { reason, programme, oldCandidate, newCandidate } = createSubstituteInput;

    // check if programme exist

    const programmeId = await this.programmesService.findOneByCode(programme);

    if (!programmeId) {
      throw new HttpException('Programme does not exist', HttpStatus.BAD_REQUEST);
    }

    // check if old candidate exist

    const oldCandidateId = await this.candidatesService.findOneByChestNo(oldCandidate);

    if (!oldCandidateId) {
      throw new HttpException('Old Candidate does not exist', HttpStatus.BAD_REQUEST);
    }

    // check if new candidate exist

    const newCandidateId = await this.candidatesService.findOneByChestNo(newCandidate);

    if (!newCandidateId) {
      throw new HttpException('New Candidate does not exist', HttpStatus.BAD_REQUEST);
    }

    // CHECKING THE USER HAVE PERMISSION TO ACCESS THE PROGRAMME BY CATEGORY

    await this.credentialService.checkPermissionOnCategories(user, programmeId.category?.name);

    // CHECKING THE USER HAVE PERMISSION TO ACCESS THE CANDIDATE BY TEAM

    await this.credentialService.checkPermissionOnTeam(user, oldCandidateId.team?.name);

    // check if old candidate is in programme

    let isOldCandidateInProgramme: CandidateProgramme = null;
    if (programmeId.type === Type.SINGLE) {
      isOldCandidateInProgramme = await this.candidatesService.findOneByChestNoAndProgrammeId(
        oldCandidate,
        programme,
      );
    } else {
      isOldCandidateInProgramme =
        await this.candidateProgrammeService.checkCandidateInGroupProgramme(
          oldCandidate,
          programme,
        );
    }

    if (!isOldCandidateInProgramme) {
      throw new HttpException(
        `The candidate ${oldCandidate} is not in programme ${programmeId.name}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // check the eligibility of new candidate

    await this.candidateProgrammeService.checkEligibility(newCandidateId, programmeId);

    try {
      const substitute = this.substituteRepository.create({
        reason,
        programme: programmeId,
        oldCandidate: oldCandidateId,
        newCandidate: newCandidateId,
      });

      const data = await this.substituteRepository.save(substitute);

      // send notification to admin by firebase

      this.addData(data, 'substitute');

      return data;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(fields: string[]) {
    const allowedRelations = ['programme', 'oldCandidate', 'newCandidate'];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.substituteRepository
        .createQueryBuilder('substitute')
        .leftJoinAndSelect('substitute.programme', 'programme')
        .leftJoinAndSelect('substitute.oldCandidate', 'oldCandidate')
        .leftJoinAndSelect('substitute.newCandidate', 'newCandidate')
        .orderBy('substitute.id', 'ASC');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `substitute.${column}`;
          }
        }),
      );
      const substitute = await queryBuilder.getMany();
      return substitute;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding substitute ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findOne(id: number, fields: string[]) {
    const allowedRelations = ['programme', 'oldCandidate', 'newCandidate'];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.substituteRepository
        .createQueryBuilder('substitute')
        .where('substitute.id = :id', { id })
        .leftJoinAndSelect('substitute.programme', 'programme')
        .leftJoinAndSelect('substitute.oldCandidate', 'oldCandidate')
        .leftJoinAndSelect('substitute.newCandidate', 'newCandidate')
        .orderBy('substitute.id', 'ASC');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `substitute.${column}`;
          }
        }),
      );
      const substitute = await queryBuilder.getOne();
      return substitute;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding substitute ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async update(id: number, updateSubstituteInput: UpdateSubstituteInput, user: Credential) {
    const { reason, programme, oldCandidate, newCandidate } = updateSubstituteInput;

    // check if programme exist

    const programmeId = await this.programmesService.findOneByCode(programme);

    if (!programmeId) {
      throw new HttpException('Programme does not exist', HttpStatus.BAD_REQUEST);
    }

    // check if old candidate exist

    const oldCandidateId = await this.candidatesService.findOneByChestNo(oldCandidate);

    if (!oldCandidateId) {
      throw new HttpException('Old Candidate does not exist', HttpStatus.BAD_REQUEST);
    }

    // check if new candidate exist

    const newCandidateId = await this.candidatesService.findOneByChestNo(newCandidate);

    if (!newCandidateId) {
      throw new HttpException('New Candidate does not exist', HttpStatus.BAD_REQUEST);
    }

    // CHECKING THE USER HAVE PERMISSION TO ACCESS THE PROGRAMME BY CATEGORY

    await this.credentialService.checkPermissionOnCategories(user, programmeId.category.name);

    // CHECKING THE USER HAVE PERMISSION TO ACCESS THE CANDIDATE BY TEAM

    

    await this.credentialService.checkPermissionOnTeam(user, oldCandidateId.team.name);

    // check if old candidate is in programme

    const isOldCandidateInProgramme = await this.candidatesService.findOneByChestNoAndProgrammeId(
      oldCandidate,
      programme,
    );

    if (!isOldCandidateInProgramme) {
      throw new HttpException(
        `The candidate ${oldCandidate} is not in programme ${programme}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // check if new candidate is in programme

    const isNewCandidateInProgramme = await this.candidatesService.findOneByChestNoAndProgrammeId(
      newCandidate,
      programme,
    );

    if (isNewCandidateInProgramme) {
      throw new HttpException(
        `The candidate ${newCandidate} is already in programme ${programmeId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // check the eligibility of new candidate

    await this.candidateProgrammeService.checkEligibility(newCandidateId, programmeId);

    try {
      const substitute = await this.findOne(id, ['id']);
      substitute.reason = reason;
      substitute.programme = programmeId;
      substitute.oldCandidate = oldCandidateId;
      substitute.newCandidate = newCandidateId;
      return this.substituteRepository.save(substitute);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number, user: Credential) {
    const substitute = await this.substituteRepository.findOne({
      where: { id },
      relations: ['programme', 'programme.category', 'oldCandidate', 'oldCandidate.team'],
    });

    if (!substitute) {
      throw new HttpException('No substitute found', HttpStatus.NOT_FOUND);
    }

    // CHECKING THE USER HAVE PERMISSION TO ACCESS THE PROGRAMME BY CATEGORY
    await this.credentialService.checkPermissionOnCategories(
      user,
      substitute.programme.category?.name,
    );

    // CHECKING THE USER HAVE PERMISSION TO ACCESS THE CANDIDATE BY TEAM

    await this.credentialService.checkPermissionOnTeam(user, substitute.oldCandidate?.team?.name);

    try {
      return this.substituteRepository.delete(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async ApproveSubstitute(id: number, user: Credential) {
    const substitute = await this.substituteRepository.findOne({
      where: { id },
      relations: [
        'programme',
        'oldCandidate',
        'newCandidate',
        'newCandidate.candidateProgrammes',
        'programme.category',
      ],
    });
    if (!substitute) {
      throw new HttpException('No substitute found', HttpStatus.NOT_FOUND);
    }

    const { newCandidate, oldCandidate, programme, isAccepted } = substitute;

    // CHECKING THE USER HAVE PERMISSION TO ACCESS THE PROGRAMME BY CATEGORY
    this.credentialService.checkPermissionOnCategories(user, programme.category?.name);

    if (isAccepted) {
      throw new HttpException('Substitute already accepted', HttpStatus.BAD_REQUEST);
    }

    await this.candidateProgrammeService.checkEligibility(newCandidate, programme);

    // HERE ALSO CHECKING :)
    let candidateProgramme: CandidateProgramme = null;
    if (programme.type === Type.SINGLE) {
      candidateProgramme = await this.candidatesService.findOneByChestNoAndProgrammeId(
        oldCandidate.chestNO,
        programme.programCode,
      );
    } else {
      candidateProgramme = await this.candidateProgrammeService.checkCandidateInGroupProgramme(
        oldCandidate.chestNO,
        programme.programCode,
      );
    }

    if (!candidateProgramme) {
      throw new HttpException(
        `The candidate ${oldCandidate.chestNO} is not in programme ${programme.name}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Editing the candidate programme

    if (programme.type === Type.SINGLE) {
      candidateProgramme.candidate = newCandidate;
    } else {
      if (candidateProgramme.candidate?.chestNO === oldCandidate.chestNO) {
        candidateProgramme.candidate = newCandidate;
      }

      // Editing the group
      candidateProgramme.candidatesOfGroup = candidateProgramme.candidatesOfGroup.filter(
        candidate => candidate.chestNO !== oldCandidate.chestNO,
      );

      candidateProgramme.candidatesOfGroup.push(newCandidate);
    }

    // NEED TO CHECK !!! :)
    const update: any = await this.candidateProgrammeService.acceptSubstitute(
      candidateProgramme.id,
      candidateProgramme,
    );

    substitute.isAccepted = true;
    substitute.isRejected = false;
    const updateSubstitute = await this.substituteRepository.save(substitute);

    if (!update || !updateSubstitute) {
      throw new HttpException('Substitute not accepted', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return updateSubstitute;
  }

  async RejectSubstitute(id: number, user: Credential) {
    const substitute = await this.substituteRepository.findOne({
      where: { id },
      relations: ['programme', 'programme.category'],
    });

    if (!substitute) {
      throw new HttpException('No substitute found', HttpStatus.NOT_FOUND);
    }

    if (substitute.isAccepted) {
      throw new HttpException('Substitute already accepted', HttpStatus.BAD_REQUEST);
    }

    // CHECKING THE USER HAVE PERMISSION TO ACCESS THE PROGRAMME BY CATEGORY

    this.credentialService.checkPermissionOnCategories(user, substitute.programme?.category?.name);

    substitute.isAccepted = false;
    substitute.isRejected = true;

    try {
      const updateSubstitute = await this.substituteRepository.save(substitute);

      return updateSubstitute;
    } catch (error) {
      throw new HttpException('Substitute not rejected', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  }; //by adding your credentials, you get authorized to read and write from the database

  private app = firebase.initializeApp(this.firebaseConfig);
  /**
   * Loading Firebase Database and refering
   * to user_data Object from the Database
   */
  private db = firebasedb.getDatabase(this.app);

  addData(data: Substitute, folderName: string) {
    var dataList;
    firebasedb
      .get(firebasedb.child(firebasedb.ref(this.db), 'messages'))
      .then(snapshot => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
          dataList = snapshot.val();
          dataList.push(data);
          var newData = {
            '/messages': dataList,
          };
          firebasedb
            .update(firebasedb.ref(this.db), newData)
            .then()
            .catch(e => {
              throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
            });
        } else {
          var new_data = {
            '/messages': data,
          };
          firebasedb
            .update(firebasedb.ref(this.db), new_data)
            .then()
            .catch(e => {
              console.log(e);
            });
        }
      })
      .catch(error => {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }
}

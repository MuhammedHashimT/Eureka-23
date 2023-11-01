import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCandidateProgrammeInput } from './dto/create-candidate-programme.input';
import { UpdateCandidateProgrammeInput } from './dto/update-candidate-programme.input';
import { CandidateProgramme } from './entities/candidate-programme.entity';
import { CandidatesService } from 'src/candidates/candidates.service';
import { ProgrammesService } from 'src/programmes/programmes.service';
import { Category } from 'src/category/entities/category.entity';
import { Mode, Model, Programme } from 'src/programmes/entities/programme.entity';
import { Candidate } from 'src/candidates/entities/candidate.entity';
import { CategorySettings } from 'src/category-settings/entities/category-setting.entity';
import { Type } from 'src/programmes/dto/create-programme.input';
import { Team } from 'src/teams/entities/team.entity';
import { CategoryService } from 'src/category/category.service';
import { Credential } from 'src/credentials/entities/credential.entity';
import { DetailsService } from 'src/details/details.service';
import { CategorySettingsService } from 'src/category-settings/category-settings.service';
import { Roles } from 'src/credentials/roles/roles.enum';
import { CredentialsService } from 'src/credentials/credentials.service';
import { fieldsIdChecker, fieldsValidator } from 'src/utils/util';
import { CustomSettingsService } from 'src/custom-settings/custom-settings.service';
import { CustomSetting } from 'src/custom-settings/entities/custom-setting.entity';

@Injectable()
export class CandidateProgrammeService {

  constructor(
    @InjectRepository(CandidateProgramme)
    private candidateProgrammeRepository: Repository<CandidateProgramme>,
    @Inject(forwardRef(() => CandidatesService))
    private readonly candidateService: CandidatesService,
    private readonly programmeService: ProgrammesService,
    private readonly categoryService: CategoryService,
    private readonly detailService: DetailsService,
    private readonly categorySettingsService: CategorySettingsService,
    private readonly credentialService: CredentialsService,
    private readonly customSettingsService: CustomSettingsService,
  ) { }

  // to get same team candidates
  teamCandidates(candidateProgrammes: CandidateProgramme[], team: Team) {
    return candidateProgrammes.filter((e: CandidateProgramme) => {
      return e.candidate?.team?.name == team.name;
    });
  }

  hasDuplicateValues = (arr) => {
    return new Set(arr).size !== arr.length;
  };

  // create candidate programme
  async create(createCandidateProgrammeInput: CreateCandidateProgrammeInput, user: Credential) {
    const { chestNo, programme_code } = createCandidateProgrammeInput;
    const checkedCandidatesOfGroup: Candidate[] = [];
    //  candidate
    const candidate: Candidate = await this.candidateService.findOneByChestNo(chestNo);

    if (!candidate) {
      throw new HttpException(
        `Can't find candidate with chest number ${chestNo}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    //  programme
    const programme: Programme = await this.programmeService.findOneByCode(programme_code);

    if (!programme) {
      throw new HttpException(
        `Can't find programme with programme id ${programme_code}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const category = programme.category;

    // check permission on category
    await this.credentialService.checkPermissionOnCategories(user, category.name);

    // checking the teamManager can add candidate to this programme
    if (user.roles === Roles.TeamManager) {
      // check permission on team
      await this.credentialService.checkPermissionOnTeam(user, candidate.team.name);

      const HaveAccess = (
        await this.categorySettingsService.findOne(category.settings.id, [
          'id',
          'isProgrammeListUpdatable',
        ])
      ).isProgrammeListUpdatable;

      console.log(HaveAccess);

      if (!HaveAccess) {
        throw new HttpException(
          'Your access is denied , please contact controller',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (programme.type !== Type.SINGLE) {
      const candidatesOfGroup = createCandidateProgrammeInput.candidatesOfGroup;

      if (!candidatesOfGroup) {
        throw new HttpException(`Can't find candidates of group`, HttpStatus.BAD_REQUEST);
      }

      const hasDuplicateValues = this.hasDuplicateValues(candidatesOfGroup)

      if (hasDuplicateValues) {
        throw new HttpException(`Duplicate chestNo detected`, HttpStatus.BAD_REQUEST);
      }


      // checking the group is full
      if (candidatesOfGroup.length !== programme.candidateCount) {
        throw new HttpException(
          `Group size is not equal to ${programme.candidateCount}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // checking the candidate is there
      for (let i = 0; i < candidatesOfGroup.length; i++) {
        const candidate: Candidate = await this.candidateService.findOneByChestNo(
          candidatesOfGroup[i],
        );

        if (!candidate) {
          throw new HttpException(
            `Can't find candidate with chest number ${candidatesOfGroup[i]}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        checkedCandidatesOfGroup.push(candidate);
      }

      // checking the leader is in the group
      const isLeaderInGroup: boolean = candidatesOfGroup.includes(chestNo);

      if (!isLeaderInGroup) {
        throw new HttpException(`Leader is not in the group`, HttpStatus.BAD_REQUEST);
      }

      // checking the eligibility of the group
      await this.checkEligibilityOnGroup(checkedCandidatesOfGroup, programme);

      // checking the availability on the team
      await this.checkAvailabilityOnTeam(candidate, programme);
    } else {
      // checking the candidate is eligible to this programme

      await this.checkEligibility(candidate, programme);

      // checking The candidate have available access on the team

      await this.checkAvailabilityOnTeam(candidate, programme);
    }

    try {
      const newCandidateProgrammeInput = this.candidateProgrammeRepository.create({
        programme,
        candidate,
        candidatesOfGroup: checkedCandidatesOfGroup,
      });

      //  return newCandidateProgrammeInput
      return this.candidateProgrammeRepository.save(newCandidateProgrammeInput);
    } catch (e) {
      throw new HttpException(
        'An Error have when inserting data , please check the all required fields are filled ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  // create many candidate programme
  async createMany(
    createCandidateProgrammeInput: CreateCandidateProgrammeInput[],
    user: Credential,
  ) {
    // check all inputs are valid
    const checkedInputs: CreateCandidateProgrammeInput[] = [];
    const errors: string[] = [];
    const uploadedData: CandidateProgramme[] = [];

    for (let i = 0; i < createCandidateProgrammeInput.length; i++) {
      const cp = createCandidateProgrammeInput[i];
      const { chestNo, programme_code } = cp;

      //  candidate
      const candidate: Candidate = await this.candidateService.findOneByChestNoWithoutError(chestNo);
      const checkedCandidatesOfGroup: Candidate[] = [];

      if (!candidate) {
        errors.push(`Can't find candidate with chest number ${chestNo}`);
        continue;
      }

      //  programme
      const programme: Programme = await this.programmeService.findOneByCodeWithouError(programme_code);

      if (!programme) {
        errors.push(`Can't find programme with programme id ${programme_code}`);
        continue;
      }

      const category = programme.category;

      // check permission on category
      const IsPermittednCategories =
        await this.credentialService.checkPermissionOnCategoriesWithouError(user, category.name);

      if (!IsPermittednCategories) {
        errors.push(`You don't have permission on category ${category.name}`);
        continue;
      }

      // checking the teamManager can add candidate to this programme
      if (user.roles === Roles.TeamManager) {
        // check permission on team
        const IsPermittedOnTeam = await this.credentialService.checkPermissionOnTeamWithouError(
          user,
          candidate.team.name,
        );

        if (!IsPermittedOnTeam) {
          errors.push(`You don't have permission on team ${candidate.team.name}`);
          continue;
        }

        const HaveAccess = (
          await this.categorySettingsService.findOne(category.settings.id, [
            'id',
            'isProgrammeListUpdatable',
          ])
        ).isProgrammeListUpdatable;

        if (!HaveAccess) {
          errors.push(`Your access is denied , please contact controller`);
          continue;
        }
      }

      if (programme.type !== Type.SINGLE) {
        const candidatesOfGroup = cp.candidatesOfGroup;

        if (!candidatesOfGroup) {
          errors.push(`Can't find candidates of group on programme ${programme.programCode}`);
          continue;
        }


        const hasDuplicateValues = this.hasDuplicateValues(candidatesOfGroup)

        if (hasDuplicateValues) {
          errors.push(`duplicate chestNo detected on programme ${programme.programCode}`)
        }

        // checking the group is full
        if (candidatesOfGroup.length !== programme.candidateCount) {
          errors.push(
            `Group size is not equal to ${programme.candidateCount} on programme ${programme.programCode}`,
          );
          continue;
        }

        // checking the candidate is there
        for (let i = 0; i < candidatesOfGroup.length; i++) {
          const candidate: Candidate = await this.candidateService.findOneByChestNo(
            candidatesOfGroup[i],
          );

          if (!candidate) {
            errors.push(
              `Can't find candidate with chest number ${candidatesOfGroup[i]} on programme ${programme.programCode}`,
            );
            continue;
          }

          checkedCandidatesOfGroup.push(candidate);
        }

        // checking the leader is in the group
        const isLeaderInGroup: boolean = candidatesOfGroup.includes(chestNo);

        if (!isLeaderInGroup) {
          errors.push(`Leader is not in the group on programme ${programme.programCode}`);
          continue;
        }

        // checking the eligibility of the group
        const isEligibleOnGroup: boolean = await this.checkEligibilityOnGroupWithoutError(
          checkedCandidatesOfGroup,
          programme,
        );

        if (!isEligibleOnGroup) {
          errors.push(`The group is not eligible on programme ${programme.programCode}`);
          continue;
        }

        // checking the availability on the team
        const isEligibleOnTeam: boolean = await this.checkAvailabilityOnTeamWitoutError(
          candidate,
          programme,
        );

        if (!isEligibleOnTeam) {
          errors.push(`The candidate is not eligible on programme ${programme.programCode}`);
          continue;
        }

        // if all are valid push to checkedInputs
        checkedInputs.push(cp);

        const newCandidateProgrammeInput = this.candidateProgrammeRepository.create({
          programme,
          candidate,
          candidatesOfGroup: checkedCandidatesOfGroup,
        });

        //  return newCandidateProgrammeInput
        const data = await this.candidateProgrammeRepository.save(newCandidateProgrammeInput);

        uploadedData.push(data);
      } else {
        // checking the candidate is eligible to this programme

        const isEligibleForProgramme = await this.checkEligibilityWithoutError(
          candidate,
          programme,
        );

        if (!isEligibleForProgramme) {
          errors.push(`The candidate is not eligible on programme ${programme.programCode}`);
          continue;
        }

        // checking The candidate have available access on the team

        const isAvailable = await this.checkAvailabilityOnTeamWitoutError(candidate, programme);

        if (!isAvailable) {
          errors.push(`The candidate is not eligible on programme ${programme.programCode}`);
          continue;
        }

        // if all are valid push to checkedInputs
        checkedInputs.push(cp);

        const newCandidateProgrammeInput = this.candidateProgrammeRepository.create({
          programme,
          candidate,
          candidatesOfGroup: checkedCandidatesOfGroup,
        });

        //  return newCandidateProgrammeInput
        const data = await this.candidateProgrammeRepository.save(newCandidateProgrammeInput);

        uploadedData.push(data);
      }
    }

    return { result: uploadedData, errors };
  }

  async findAll(fields: string[]) {
    const allowedRelations = [
      'programme',
      'candidate',
      'grade',
      'position',
      'candidate.team',
      'candidate.category',
      'programme.category',
      'candidatesOfGroup',
      'programme.skill',
    ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);
    try {
      const queryBuilder = this.candidateProgrammeRepository
        .createQueryBuilder('candidateProgramme')
        .leftJoinAndSelect('candidateProgramme.programme', 'programme')
        .leftJoinAndSelect('candidateProgramme.candidate', 'candidate')
        .leftJoinAndSelect('candidateProgramme.candidatesOfGroup', 'candidatesOfGroup')
        .leftJoinAndSelect('candidateProgramme.grade', 'grade')
        .leftJoinAndSelect('candidateProgramme.position', 'position')
        .leftJoinAndSelect('candidate.team', 'team')
        .leftJoinAndSelect('candidate.category', 'category')
        .leftJoinAndSelect('programme.category', 'programmeCategory')
        .leftJoinAndSelect('programme.skill', 'skill');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `candidateProgramme.${column}`;
          }
        }),
      );
      const candidateProgramme = await queryBuilder.getMany();
      return candidateProgramme;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding candidateProgramme ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  findOne(id: number) {
    return this.candidateProgrammeRepository.findOne({
      where: { id },
      relations: [
        'programme',
        'candidate',
        'grade',
        'position',
        'candidate.team',
        'candidate.category',
        'programme.category',
        'candidatesOfGroup',
        'candidatesOfGroup.team',
        'candidatesOfGroup.category',
      ],
    });
  }

  async findOneByCandidateAndProgramme(candidate: Candidate, programme: Programme) {
    const Query = this.candidateProgrammeRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.candidate', 'candidate')
      .leftJoinAndSelect('c.programme', 'programme')
      .leftJoinAndSelect('candidate.category', 'category')
      .leftJoinAndSelect('candidate.team', 'team')
      .leftJoinAndSelect('programme.category', 'programmeCategory')
      .leftJoinAndSelect('programme.skill', 'skill')
      .leftJoinAndSelect('category.settings', 'settings')
      .leftJoinAndSelect('candidate.candidateProgrammes', 'cp');

    const data = await Query.where('candidate.id = :candidateId', { candidateId: candidate.id })
      .andWhere('programme.id = :programmeId', { programmeId: programme.id })
      .getOne();

    return data;
  }

  async update(
    id: number,
    updateCandidateProgrammeInput: UpdateCandidateProgrammeInput,
    user: Credential,
  ) {
    const checkedCandidatesOfGroup: Candidate[] = [];
    const checkedForEligibility: Candidate[] = [];
    // checking is The candidateProgramme exist
    const candidateProgramme: CandidateProgramme = await this.findOne(id);
    if (!candidateProgramme) {
      throw new HttpException('The candidate programme is not exist', HttpStatus.BAD_REQUEST);
    }

    // cant change the programme

    if (updateCandidateProgrammeInput.programme_code !== candidateProgramme.programme.programCode) {
      throw new HttpException(`Can't change the programme`, HttpStatus.BAD_REQUEST);
    }

    //  candidate
    const candidate: Candidate = await this.candidateService.findOneByChestNo(
      updateCandidateProgrammeInput.chestNo,
    );

    //  programme
    const programme: Programme = await this.programmeService.findOneByCode(
      updateCandidateProgrammeInput.programme_code,
    );

    if (!candidate || !programme) {
      throw new HttpException(`Can't find candidate or programme`, HttpStatus.BAD_REQUEST);
    }

    const category = programme.category;

    // check permission on category

    this.credentialService.checkPermissionOnCategories(user, category.name);

    // checking the teamManager can add candidate to this programme
    if (user.roles === Roles.TeamManager) {
      // check permission on team

      this.credentialService.checkPermissionOnTeam(user, candidate.team.name);

      const HaveAcces = (
        await this.categorySettingsService.findOne(category.settings.id, [
          'id',
          'isProgrammeListUpdatable',
        ])
      ).isProgrammeListUpdatable;

      if (!HaveAcces) {
        throw new HttpException(
          'Your access is denied , please contact controller',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // checking the candidate is eligible to this programme

    // checking eligibility on single and group
    if (programme.type !== Type.SINGLE) {

      const hasDuplicateValues = this.hasDuplicateValues(updateCandidateProgrammeInput.candidatesOfGroup)

      if (hasDuplicateValues) {
        throw new HttpException(`Duplicate chestNo detected`, HttpStatus.BAD_REQUEST);
      }
      // checking the group is full
      if (updateCandidateProgrammeInput.candidatesOfGroup.length !== programme.candidateCount) {
        throw new HttpException(
          `Group size is not equal to ${programme.candidateCount}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // checking the candidate is there
      for (let i = 0; i < updateCandidateProgrammeInput.candidatesOfGroup.length; i++) {
        const oldCandidate: Candidate = candidateProgramme.candidatesOfGroup[i];

        const candidate: Candidate = await this.candidateService.findOneByChestNo(
          updateCandidateProgrammeInput.candidatesOfGroup[i],
        );

        if (!candidate) {
          throw new HttpException(
            `Can't find candidate with chest number ${updateCandidateProgrammeInput.candidatesOfGroup[i]}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        checkedCandidatesOfGroup.push(candidate);

        // checking the team of new and old candidate is same
        if (candidate.team.name !== oldCandidate.team?.name) {
          throw new HttpException(
            `The candidate team is not same as old candidate team`,
            HttpStatus.BAD_REQUEST,
          );
        }

        const isNew = candidateProgramme.candidatesOfGroup.filter(candidateP => {
          return candidateP.chestNO === candidate.chestNO;
        });

        if (isNew.length === 0) {
          checkedForEligibility.push(candidate);
        }
      }

      // checking the leader is in the group
      const isLeaderInGroup: boolean = updateCandidateProgrammeInput.candidatesOfGroup.includes(
        updateCandidateProgrammeInput.chestNo,
      );

      if (!isLeaderInGroup) {
        throw new HttpException(`Leader is not in the group`, HttpStatus.BAD_REQUEST);
      }

      // checking the eligibility of the group
      await this.checkEligibilityOnGroup(checkedForEligibility, programme);
    } else {
      await this.checkEligibility(candidate, programme);

      // checking the team of new and old candidate is same
      if (candidate.team.name !== candidateProgramme.candidate.team.name) {
        throw new HttpException(
          `The candidate team is not same as old candidate team`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    try {
      const updated = await this.candidateProgrammeRepository.save({
        ...candidateProgramme,
        candidate,
        candidatesOfGroup: checkedCandidatesOfGroup,
      });

      //   if(programme.type !== Type.SINGLE){
      //     await this.candidateService.addGroupProgrammeToCandidate(candidate, updated);
      //  }
      return updated;
    } catch (e) {
      throw new HttpException(
        'An Error have when inserting data , please check the all required fields are filled ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  async acceptSubstitute(id: number, candidateProgramme: CandidateProgramme) {
    const candidate: Candidate = candidateProgramme.candidate;
    const programme: Programme = candidateProgramme.programme;
    if (!candidate || !programme) {
      throw new HttpException(`The candidate or programme is not exist`, HttpStatus.BAD_REQUEST);
    }

    try {
      return this.candidateProgrammeRepository.save({
        ...candidateProgramme,
      });
    } catch (e) {
      throw new HttpException(
        'An Error have when inserting data , please check the all required fields are filled ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  async remove(id: number, user: Credential) {
    // checking is The candidateProgramme exist
    const candidateProgramme: CandidateProgramme = await this.candidateProgrammeRepository.findOne({
      where: { id },
      relations: ['programme', 'programme.category', 'candidate', 'candidate.team'],
    });

    const category = candidateProgramme.programme.category;
    const team = candidateProgramme.candidate.team;

    // check permission on category
    this.credentialService.checkPermissionOnCategories(user, category.name);

    // checking the teamManager can add candidate to this programme
    if (user.roles === Roles.TeamManager) {
      // check permission on team

      this.credentialService.checkPermissionOnTeam(user, team.name);

      const HaveAcces = (
        await this.categorySettingsService.findOne(category.settings.id, [
          'id',
          'isProgrammeListUpdatable',
        ])
      ).isProgrammeListUpdatable;

      if (!HaveAcces) {
        throw new HttpException(
          'Your access is denied , please contact controller',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (!candidateProgramme) {
      throw new HttpException('The candidate programme is not exist', HttpStatus.BAD_REQUEST);
    }
    try {
      return this.candidateProgrammeRepository.delete(id);
    } catch (e) {
      throw new HttpException(
        'An error occurred when deleting data ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  async checkEligibility(candidate: Candidate, programme: Programme) {
    const Query = this.candidateProgrammeRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.candidate', 'candidate')
      .leftJoinAndSelect('c.programme', 'programme')
      .leftJoinAndSelect('c.candidatesOfGroup', 'candidatesOfGroup')
      .leftJoinAndSelect('candidate.category', 'category')
      .leftJoinAndSelect('candidate.team', 'team')
      .leftJoinAndSelect('programme.category', 'programmeCategory')
      .leftJoinAndSelect('programme.skill', 'skill')
      .leftJoinAndSelect('category.settings', 'settings')
      .leftJoinAndSelect('candidate.candidateProgrammes', 'cp');

    // checking the candidate is already in the programme

    if (programme.type == Type.SINGLE) {
      // finding on his programmes
      const isAlreadyDone = await Query.where('programme.id = :id', { id: programme.id })
        .andWhere('candidate.id = :candidateId', { candidateId: candidate.id })
        .getCount();

      if (isAlreadyDone > 0) {
        throw new HttpException(
          `Already Up to date , candidate ${candidate.name} is already in programme ${programme.name} `,
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      const isAlreadyDoneInGroup: number = await Query.where('programme.id = :id', {
        id: programme.id,
      })
        .andWhere('candidatesOfGroup.id = :candidateId', { candidateId: candidate.id })
        .getCount();

      if (isAlreadyDoneInGroup > 0) {
        throw new HttpException(
          `Already Up to date , candidate ${candidate.name} is already in programme ${programme.name} `,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // CHECKING THE PROGRAMME IS ACCESSIBLE FOR CANDIDATE

    // checking the category

    if (programme.type != Type.HOUSE) {
      const isSameCategory: boolean = candidate.category?.name == programme.category?.name;

      if (!isSameCategory) {
        throw new HttpException(
          `The candidate ${candidate.name} can't participate in programme  ${programme.name} , check the category of candidate`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    //  CHECKING THE ALL RULES FROM CATEGORY SETTINGS ARE REGULATED

    //  category
    const category_name: string = candidate.category?.name;
    const category: Category = await this.categoryService.findOneByName(category_name);

    // candidate group programmes     // CHECK HERE :)
    const candidateGroupProgrammes: CandidateProgramme[] =
      await this.getCandidatesOfGroupOfCandidate(candidate.chestNO);

    // check on custom settings

    const customSetting = await this.customSettingsService.findByProgramCode(programme.programCode);

    if (customSetting) {
      const customSettingId: CustomSetting = await this.customSettingsService.findOne(
        customSetting.id,
        ['max', 'programmes.programCode', 'programmes.id', 'name'],
      );

      if (customSettingId) {
        const { max, programmes, name } = customSettingId;
        const customProgramsOnCandidate = candidate.candidateProgrammes.filter(cp => {
          for (let i = 0; i < programmes.length; i++) {
            if (cp.programme.id == programmes[i].id) {
              return true;
            }
          }
        });

        if (customProgramsOnCandidate.length >= max) {
          throw new HttpException(
            `The candidate ${candidate.name} can't participate in programme  ${programme.name}, maximum programmes on ${name} is ${max}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    //  settings
    const settings: CategorySettings = category.settings;

    // checking is it covered maximum programme limit
    if (programme.type !== Type.HOUSE && programme.model !== Model.Sports) {
      if (settings.maxProgram && (programme.type == Type.SINGLE || programme.type == Type.GROUP)) {
        const programmes: CandidateProgramme[] = candidate.candidateProgrammes;

        if (programmes.length >= settings.maxProgram) {
          throw new HttpException(
            'The candidate has covered maximum programme count',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // checking is it covered maximum single programme limit

      if (settings.maxSingle && programme.type == Type.SINGLE) {
        const SinglePrograms: CandidateProgramme[] = candidate.candidateProgrammes.filter(
          (e: CandidateProgramme) => {
            return e.programme.type == Type.SINGLE && e.programme.model !== Model.Sports;
          },
        );
        if (SinglePrograms.length >= settings.maxSingle) {
          throw new HttpException(
            'The candidate has covered maximum single programme count',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // checking is it covered maximum group programme limit

      if (settings.maxGroup && programme.type == Type.GROUP) {
        const groupPrograms: CandidateProgramme[] = candidate.candidateProgrammes.filter(
          (e: CandidateProgramme) => {
            return e.programme.type == Type.GROUP && e.programme.model !== Model.Sports;
          },
        );
        if (groupPrograms.length >= settings.maxGroup) {
          throw new HttpException(
            'The candidate has covered maximum group programme count',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // checking is it covered maximum stage programme

      if (settings.maxStage && programme.mode == Mode.STAGE && programme.type == Type.SINGLE) {
        const stagePrograms: CandidateProgramme[] = candidate.candidateProgrammes.filter(
          (e: CandidateProgramme) => {
            return e.programme.mode == Mode.STAGE && e.programme.type == Type.SINGLE && e.programme.model !== Model.Sports;
          },
        );
        if (stagePrograms.length >= settings.maxStage) {
          throw new HttpException(
            'The candidate has covered maximum stage programme count',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // checking is it covered maximum non stage programme

      if (
        settings.maxNonStage &&
        programme.mode == Mode.NON_STAGE &&
        programme.type == Type.SINGLE
      ) {
        const nonStagePrograms: CandidateProgramme[] = candidate.candidateProgrammes.filter(
          (e: CandidateProgramme) => {
            return e.programme.mode == Mode.NON_STAGE && e.programme.type == Type.SINGLE && e.programme.model !== Model.Sports;
          },
        );
        if (nonStagePrograms.length >= settings.maxNonStage) {
          throw new HttpException(
            'The candidate has covered maximum non stage programme count',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // checking is it covered maximum outdoor stage programme

      if (
        settings.maxOutDoor &&
        programme.mode == Mode.OUTDOOR_STAGE &&
        programme.type == Type.SINGLE
      ) {
        const outDoorPrograms: CandidateProgramme[] = candidate.candidateProgrammes.filter(
          (e: CandidateProgramme) => {
            return e.programme.mode == Mode.OUTDOOR_STAGE && e.programme.type == Type.SINGLE && e.programme.model !== Model.Sports;;
          },
        );
        if (outDoorPrograms.length >= settings.maxOutDoor) {
          throw new HttpException(
            'The candidate has covered maximum outdoor stage programme count',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    } else if (programme.type !== Type.HOUSE && programme.model == Model.Sports) {
      // maximum sports programme
      if (settings.maxSports && (programme.type == Type.SINGLE || programme.type == Type.GROUP)) {
        const programmes: CandidateProgramme[] = candidate.candidateProgrammes.filter(
          (e: CandidateProgramme) => {
            return e.programme.model == Model.Sports;
          },
        );

        if (programmes.length >= settings.maxSports) {
          throw new HttpException(
            'The candidate has covered maximum sports programme count',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // maximum sports single programme

      if (settings.maxSportsSingle && programme.type == Type.SINGLE) {
        const SinglePrograms: CandidateProgramme[] = candidate.candidateProgrammes.filter(
          (e: CandidateProgramme) => {
            return e.programme.type == Type.SINGLE && e.programme.model == Model.Sports;
          },
        );
        if (SinglePrograms.length >= settings.maxSportsSingle) {
          throw new HttpException(
            'The candidate has covered maximum sports single programme count',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // maximum sports group programme

      if (settings.maxSportsGroup && programme.type == Type.GROUP) {
        const groupPrograms: CandidateProgramme[] = candidate.candidateProgrammes.filter(
          (e: CandidateProgramme) => {
            return e.programme.type == Type.GROUP && e.programme.model == Model.Sports;;
          },
        );
        if (groupPrograms.length >= settings.maxSportsGroup) {
          throw new HttpException(
            'The candidate has covered maximum sports group programme count',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }
  }

  async checkEligibilityWithoutError(candidate: Candidate, programme: Programme) {
    const Query = this.candidateProgrammeRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.candidate', 'candidate')
      .leftJoinAndSelect('c.programme', 'programme')
      .leftJoinAndSelect('c.candidatesOfGroup', 'candidatesOfGroup')
      .leftJoinAndSelect('candidate.category', 'category')
      .leftJoinAndSelect('candidate.team', 'team')
      .leftJoinAndSelect('programme.category', 'programmeCategory')
      .leftJoinAndSelect('programme.skill', 'skill')
      .leftJoinAndSelect('category.settings', 'settings')
      .leftJoinAndSelect('candidate.candidateProgrammes', 'cp');

    // checking the candidate is already in the programme

    if (programme.type == Type.SINGLE) {
      // finding on his programmes
      const isAlreadyDone = await Query.where('programme.id = :id', { id: programme.id })
        .andWhere('candidate.id = :candidateId', { candidateId: candidate.id })
        .getCount();

      if (isAlreadyDone > 0) {
        return false;
      }
    } else {
      const isAlreadyDoneInGroup: number = await Query.where('programme.id = :id', {
        id: programme.id,
      })
        .andWhere('candidatesOfGroup.id = :candidateId', { candidateId: candidate.id })
        .getCount();

      if (isAlreadyDoneInGroup > 0) {
        return false;
      }
    }

    // CHECKING THE PROGRAMME IS ACCESSIBLE FOR CANDIDATE

    // checking the category

    if (programme.type != Type.HOUSE) {
      const isSameCategory: boolean = candidate.category?.name == programme.category?.name;

      if (!isSameCategory) {
        return false;
      }
    }

    //  CHECKING THE ALL RULES FROM CATEGORY SETTINGS ARE REGULATED

    //  category
    const category_name: string = candidate.category?.name;
    const category: Category = await this.categoryService.findOneByName(category_name);

    // candidate group programmes     // CHECK HERE :)
    const candidateGroupProgrammes: CandidateProgramme[] =
      await this.getCandidatesOfGroupOfCandidate(candidate.chestNO);

    // check on custom settings

    const customSetting = await this.customSettingsService.findByProgramCode(programme.programCode);

    if (customSetting) {
      const customSettingId: CustomSetting = await this.customSettingsService.findOne(
        customSetting.id,
        ['max', 'programmes.programCode', 'programmes.id', 'name'],
      );

      if (customSettingId) {
        const { max, programmes, name } = customSettingId;
        const customProgramsOnCandidate = candidate.candidateProgrammes.filter(cp => {
          for (let i = 0; i < programmes.length; i++) {
            if (cp.programme.id == programmes[i].id) {
              return true;
            }
          }
        });

        if (customProgramsOnCandidate.length >= max) {
          return false;
        }
      }
    }

    //  settings
    const settings: CategorySettings = category.settings;

    if (!settings) {
      return false;
    }

    // checking is it covered maximum programme limit
    if (programme.type !== Type.HOUSE && programme.model !== Model.Sports) {
      if (settings.maxProgram && (programme.type == Type.SINGLE || programme.type == Type.GROUP)) {
        const programmes: CandidateProgramme[] = candidate.candidateProgrammes;

        if (programmes.length >= settings.maxProgram) {
          return false;
        }
      }

      // checking is it covered maximum single programme limit

      if (settings.maxSingle && programme.type == Type.SINGLE) {
        const SinglePrograms: CandidateProgramme[] = candidate.candidateProgrammes.filter(
          (e: CandidateProgramme) => {
            return e.programme.type == Type.SINGLE;
          },
        );
        if (SinglePrograms.length >= settings.maxSingle) {
          return false;
        }
      }

      // checking is it covered maximum group programme limit

      if (settings.maxGroup && programme.type == Type.GROUP) {
        const groupPrograms: CandidateProgramme[] = candidate.candidateProgrammes.filter(
          (e: CandidateProgramme) => {
            return e.programme.type == Type.GROUP;
          },
        );
        if (groupPrograms.length >= settings.maxGroup) {
          return false;
        }
      }

      // checking is it covered maximum stage programme

      if (settings.maxStage && programme.mode == Mode.STAGE && programme.type == Type.SINGLE) {
        const stagePrograms: CandidateProgramme[] = candidate.candidateProgrammes.filter(
          (e: CandidateProgramme) => {
            return e.programme.mode == Mode.STAGE && e.programme.type == Type.SINGLE;
          },
        );
        if (stagePrograms.length >= settings.maxStage) {
          return false;
        }
      }

      // checking is it covered maximum non stage programme

      if (
        settings.maxNonStage &&
        programme.mode == Mode.NON_STAGE &&
        programme.type == Type.SINGLE
      ) {
        const nonStagePrograms: CandidateProgramme[] = candidate.candidateProgrammes.filter(
          (e: CandidateProgramme) => {
            return e.programme.mode == Mode.NON_STAGE && e.programme.type == Type.SINGLE;
          },
        );
        if (nonStagePrograms.length >= settings.maxNonStage) {
          return false;
        }
      }

      // checking is it covered maximum outdoor stage programme

      if (
        settings.maxOutDoor &&
        programme.mode == Mode.OUTDOOR_STAGE &&
        programme.type == Type.SINGLE
      ) {
        const outDoorPrograms: CandidateProgramme[] = candidate.candidateProgrammes.filter(
          (e: CandidateProgramme) => {
            return e.programme.mode == Mode.OUTDOOR_STAGE && e.programme.type == Type.SINGLE;
          },
        );
        if (outDoorPrograms.length >= settings.maxOutDoor) {
          return false;
        }
      }
    } else if (programme.type !== Type.HOUSE && programme.model == Model.Sports) {
      // maximum sports programme
      if (settings.maxSports && (programme.type == Type.SINGLE || programme.type == Type.GROUP)) {
        const programmes: CandidateProgramme[] = candidate.candidateProgrammes;

        if (programmes.length >= settings.maxSports) {
          return false;
        }
      }

      // maximum sports single programme

      if (settings.maxSportsSingle && programme.type == Type.SINGLE) {
        const SinglePrograms: CandidateProgramme[] = candidate.candidateProgrammes.filter(
          (e: CandidateProgramme) => {
            return e.programme.type == Type.SINGLE;
          },
        );
        if (SinglePrograms.length >= settings.maxSportsSingle) {
          return false;
        }
      }

      // maximum sports group programme

      if (settings.maxSportsGroup && programme.type == Type.GROUP) {
        const groupPrograms: CandidateProgramme[] = candidate.candidateProgrammes.filter(
          (e: CandidateProgramme) => {
            return e.programme.type == Type.GROUP;
          },
        );
        if (groupPrograms.length >= settings.maxSportsGroup) {
          return false;
        }
      }
    }
    return true;
  }

  async checkEligibilityOnGroup(candidatesOfGroup: Candidate[], programme: Programme) {
    // checking each candidate on the group

    for (let i = 0; i < candidatesOfGroup.length; i++) {
      const candidate = candidatesOfGroup[i];
      await this.checkEligibility(candidate, programme);
    }

    // checking all candidates are in same team
    const teams: Team[] = candidatesOfGroup.map((e: Candidate) => {
      return e.team;
    });

    const isSameTeam: boolean = teams.every((val, i, arr) => val.id === arr[0].id);

    if (!isSameTeam) {
      throw new HttpException(`All candidates must be in same team`, HttpStatus.BAD_REQUEST);
    }
  }

  async checkEligibilityOnGroupWithoutError(candidatesOfGroup: Candidate[], programme: Programme) {
    // checking each candidate on the group

    for (let i = 0; i < candidatesOfGroup.length; i++) {
      const candidate = candidatesOfGroup[i];
      const isEligible = await this.checkEligibilityWithoutError(candidate, programme);

      if (!isEligible) {
        return false;
      }
    }

    // checking all candidates are in same team
    const teams: Team[] = candidatesOfGroup.map((e: Candidate) => {
      return e.team;
    });

    const isSameTeam: boolean = teams.every((val, i, arr) => val.id === arr[0].id);

    if (!isSameTeam) {
      return false;
    }

    return true;
  }

  async checkAvailabilityOnTeam(candidate: Candidate, programme: Programme) {
    // CHECKING THE LIMIT OF CANDIDATES IN A TEAM COVERED

    const team: Team = candidate.team;

    //  candidates of the programme
    const programmeCandidates: CandidateProgramme[] = programme.candidateProgramme;
    // candidates on the team

    const onTeamCandidates = this.teamCandidates(programmeCandidates, team);

    // On single programmes
    if (programme.type == Type.SINGLE) {
      if (onTeamCandidates.length >= programme.candidateCount) {
        throw new HttpException(
          `The limit of candidate from a team exceed , you have already ${onTeamCandidates.length} candidates out of ${programme.candidateCount} , please check it`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // On Group or House programmes
    if (programme.type !== Type.SINGLE) {
      // checking The candidates on each group is exceed the limit or not
      if (onTeamCandidates.length >= programme.groupCount) {
        throw new HttpException(
          `A team only have access to have ${programme.groupCount} groups on program ${programme.name}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  async checkAvailabilityOnTeamWitoutError(candidate: Candidate, programme: Programme) {
    // CHECKING THE LIMIT OF CANDIDATES IN A TEAM COVERED

    const team: Team = candidate.team;

    //  candidates of the programme
    const programmeCandidates: CandidateProgramme[] = programme.candidateProgramme;
    // candidates on the team

    const onTeamCandidates = this.teamCandidates(programmeCandidates, team);

    // On single programmes
    if (programme.type == Type.SINGLE) {
      if (onTeamCandidates.length >= programme.candidateCount) {
        return false;
      }
    }

    // On Group or House programmes
    if (programme.type !== Type.SINGLE) {
      // checking The candidates on each group is exceed the limit or not
      if (onTeamCandidates.length >= programme.groupCount) {
        return false;
      }
    }

    return true;
  }

  async getCandidatesOfGroupOfCandidate(chessNo: string) {
    const Query = this.candidateProgrammeRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.candidate', 'candidate')
      .leftJoinAndSelect('c.programme', 'programme')
      .leftJoinAndSelect('c.candidatesOfGroup', 'candidatesOfGroup')
      .leftJoinAndSelect('candidate.category', 'category')
      .leftJoinAndSelect('candidate.team', 'team')
      .leftJoinAndSelect('programme.category', 'programmeCategory')
      .leftJoinAndSelect('programme.skill', 'skill')
      .leftJoinAndSelect('category.settings', 'settings')
      .leftJoinAndSelect('candidate.candidateProgrammes', 'cp');

    const candidatesOfGroups: CandidateProgramme[] = await Query.where(
      'candidatesOfGroup.chestNO = :candidateId',
      { candidateId: chessNo },
    ).getMany();

    return candidatesOfGroups;
  }

  async checkCandidateInGroupProgramme(chestNO: string, programCode: string) {
    const Query = this.candidateProgrammeRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.programme', 'programme')
      .leftJoinAndSelect('c.candidatesOfGroup', 'candidatesOfGroup');

    const findedCandidatesOfGroups: CandidateProgramme = await Query.where(
      'programme.programCode = :id',
      {
        id: programCode,
      },
    )
      .andWhere('candidatesOfGroup.chestNO = :candidateId', { candidateId: chestNO })
      .getOne();

    const candidatesOfGroups: CandidateProgramme = await this.findOne(findedCandidatesOfGroups.id);

    return candidatesOfGroups;
  }

  async getCandidatesOfProgramme(programCode: string) {
    const programme: Programme = await this.programmeService.findOneByCode(programCode);

    return programme.candidateProgramme;
  }

}

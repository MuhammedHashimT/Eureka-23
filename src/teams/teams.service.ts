import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTeamInput } from './dto/create-team.input';
import { UpdateTeamInput } from './dto/update-team.input';
import { Team } from './entities/team.entity';
import { fieldsIdChecker, fieldsValidator } from 'src/utils/util';
import { Model } from 'src/programmes/entities/programme.entity';
import { CandidateProgrammeService } from 'src/candidate-programme/candidate-programme.service';
import { CategoryService } from 'src/category/category.service';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team) private teamRepository: Repository<Team>,
    
  ) {}

  create(createTeamInput: CreateTeamInput) {
    try {
      const newTeamInput = this.teamRepository.create(createTeamInput);
      return this.teamRepository.save(newTeamInput);
    } catch (e) {
      throw new HttpException(
        'An Error have when creating team ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findAll(fields: string[]) {
    const allowedRelations = [
      'candidates',
      'candidates.candidateProgrammes',
      'candidates.category',
      'candidates.candidateProgrammes.programme',
    ];

    // any field that contains . as relation and not in the list will removed from the list
    fields = fieldsValidator(fields, allowedRelations);

    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.teamRepository
        .createQueryBuilder('team')
        .leftJoinAndSelect('team.candidates', 'candidates')
        .leftJoinAndSelect('candidates.candidateProgrammes', 'candidateProgrammes')
        .leftJoinAndSelect('candidates.category', 'category')
        .leftJoinAndSelect('candidateProgrammes.programme', 'programme')
        .orderBy('team.name', 'ASC');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `team.${column}`;
          }
        }),
      );

      const team = await queryBuilder.getMany();
      return team;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding team ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findOne(id: number, fields: string[]) {
    if (!id) {
      throw new HttpException(`team cannot be undefined`, HttpStatus.BAD_REQUEST);
    }

    const allowedRelations = [
      'candidates',
      'candidates.candidateProgrammes',
      'candidates.category',
      'candidates.candidateProgrammes.programme',
      'credentials',
      'credentials.categories',
    ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.teamRepository
        .createQueryBuilder('team')
        .where('team.id = :id', { id })
        .leftJoinAndSelect('team.candidates', 'candidates')
        .leftJoinAndSelect('candidates.candidateProgrammes', 'candidateProgrammes')
        .leftJoinAndSelect('candidates.category', 'category')
        .leftJoinAndSelect('candidateProgrammes.programme', 'programme')
        .leftJoinAndSelect('team.credentials', 'credentials')
        .leftJoinAndSelect('credentials.categories', 'categories');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `team.${column}`;
          }
        }),
      );
      const team = await queryBuilder.getOne();
      return team;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding team ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findOneByName(name: string, fields: string[]) {
    if (!name) {
      throw new HttpException(`team cannot be undefined`, HttpStatus.BAD_REQUEST);
    }

    const allowedRelations = [
      'candidates',
      'candidates.candidateProgrammes',
      'candidates.category',
      'candidates.candidateProgrammes.programme',
      'credentials',
      'credentials.categories',
    ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.teamRepository
        .createQueryBuilder('team')
        .where('team.name = :name', { name })
        .leftJoinAndSelect('team.candidates', 'candidates')
        .leftJoinAndSelect('candidates.candidateProgrammes', 'candidateProgrammes')
        .leftJoinAndSelect('candidates.category', 'category')
        .leftJoinAndSelect('candidateProgrammes.programme', 'programme')
        .leftJoinAndSelect('team.credentials', 'credentials')
        .leftJoinAndSelect('credentials.categories', 'categories');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `team.${column}`;
          }
        }),
      );
      const team = await queryBuilder.getOne();
      return team;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding team ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async update(id: number, updateTeamInput: UpdateTeamInput) {
    const team = await this.teamRepository.findOneBy({ id });

    if (!team) {
      throw new HttpException(`cant find team with id ${id}`, HttpStatus.BAD_REQUEST);
    }
    try {
      return this.teamRepository.update(id, updateTeamInput);
    } catch (e) {
      throw new HttpException(
        'An Error have when updating team ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async remove(id: number) {
    const team = await this.teamRepository.findOneBy({ id });

    if (!team) {
      throw new HttpException(`cant find team with id ${id}`, HttpStatus.BAD_REQUEST);
    }
    try {
      return this.teamRepository.delete(id);
    } catch (e) {
      throw new HttpException(
        'An Error have when deleting team ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  // get category based team leader board

  async getCategoryBasedToppers() {
    // to do that check all candidate programmes of this category and team and add all of them to team point which initialized variable here

    // get all teams
    const teams = await this.teamRepository.find();

    // get all candidate programmes
    const candidateProgrammes = await this.teamRepository.find();

    // get all categories
    const categories = await this.teamRepository.find();


  }

  async setLastResult(id: number, lastResult: number) {
    const team = await this.teamRepository.findOneBy({ id });

    if (!team) {
      throw new HttpException(`cant find team with id ${id}`, HttpStatus.BAD_REQUEST);
    }

    try {
      return this.teamRepository.save({
        ...team,
        lastResultPoint: lastResult,
      });
    } catch (e) {
      throw new HttpException(
        'An Error have when inserting last result ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async setTeamPoint(
    id: number,
    tPoint: number,
    gPoint: number = 0,
    iPoint: number = 0,
    hPoint: number = 0,
    programModel: Model,
  ) {
    const team: Team = await this.teamRepository.findOneBy({ id });
    if (!team) {
      throw new HttpException(`cant find team with id ${id}`, HttpStatus.BAD_REQUEST);
    }

    // declaring variables

    let totalPoint: number = team.totalPoint || 0;
    let HousePoint: number =team.HousePoint || 0;
    let GroupPoint: number = team.GroupPoint || 0;
    let IndividualPoint: number = team.IndividualPoint || 0;
    let totalSportsPoint: number = team.totalSportsPoint || 0;
    let HouseSportsPoint: number = team.HouseSportsPoint  || 0;
    let GroupSportsPoint: number = team.GroupSportsPoint || 0;
    let IndividualSportsPoint: number = team.IndividualSportsPoint || 0;

    // checking if the programme is arts or sports
    if (programModel === Model.Arts) {
      totalPoint = totalPoint + tPoint;
      HousePoint = HousePoint + hPoint;
      GroupPoint = GroupPoint + gPoint;
      IndividualPoint = IndividualPoint + iPoint;
    } else if (programModel === Model.Sports) {
      totalSportsPoint = totalSportsPoint + tPoint;
      HouseSportsPoint = HouseSportsPoint + hPoint;
      GroupSportsPoint = GroupSportsPoint + gPoint;
      IndividualSportsPoint = IndividualSportsPoint + iPoint;
    }
    try {
      // saving the team
      return this.teamRepository.save({
        ...team,
        totalPoint,
        HousePoint,
        GroupPoint,
        IndividualPoint,
        totalSportsPoint,
        HouseSportsPoint,
        GroupSportsPoint,
        IndividualSportsPoint,
      });
    } catch (e) {
      throw new HttpException(
        'An Error have when inserting total point ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }
}

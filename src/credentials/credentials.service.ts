import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCredentialInput } from './dto/create-credential.input';
import { UpdateCredentialInput } from './dto/update-credential.input';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { Credential } from './entities/credential.entity';
import { CategoryService } from 'src/category/category.service';
import { TeamsService } from 'src/teams/teams.service';
import { Category } from 'src/category/entities/category.entity';
import { LoginService } from './login/login.service';
import { Roles } from './roles/roles.enum';
import { fieldsIdChecker, fieldsValidator } from 'src/utils/util';
import { JwtPayload } from './jwt/jwt.interface';
import { Team } from 'src/teams/entities/team.entity';

@Injectable()
export class CredentialsService {
  constructor(
    @InjectRepository(Credential) private CredentialRepository: Repository<Credential>,
    private readonly teamService: TeamsService,
    private readonly categoryService: CategoryService,
    private readonly LoginService: LoginService,
  ) {}

  async create(createCredentialInput: CreateCredentialInput, user: Credential) {
    let { username, password, categories, roles, team } = createCredentialInput;

    const alreadyUser = await this.CredentialRepository.findOne({
      where: {
        username,
      },
    });
    if (alreadyUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const allCategories = await this.categoryService.findAll(['name']);
    const allCategoriesNames = allCategories.map(category => category.name);

    // the the users role and check if he is allowed to create a new user
    const userRole = user.roles;

    if (userRole === Roles.Admin) {
      // admin can create any user
      categories = allCategoriesNames;
    } else if (
      userRole === Roles.Controller &&
      this.checkCategoriesEquality(user.categories, allCategories)
    ) {
      roles = Roles.Controller;
      team = null;
    } else if (
      userRole === Roles.TeamManager &&
      this.checkCategoriesEquality(user.categories, allCategories)
    ) {
      team = user.team.name;
    } else {
      throw new HttpException('You are not allowed to create a new user', HttpStatus.UNAUTHORIZED);
    }

    let teamId = null;
    if (team) {
      teamId = await this.teamService.findOneByName(team, ['id']);
    }
    let categoriesId = null;
    if (categories) {
      categoriesId = await this.categoriesMapper(categories);
    }

    if ((roles == Roles.Controller || roles == Roles.TeamManager) && !categoriesId) {
      throw new HttpException('You must select at least one category', HttpStatus.BAD_REQUEST);
    }

    if (roles === Roles.TeamManager && !teamId) {
      throw new HttpException('You must select a team', HttpStatus.BAD_REQUEST);
    }

    let hashedPassword = await this.LoginService.hashPassword(password);

    const newCredential = this.CredentialRepository.create({
      username,
      password: hashedPassword,
      roles: roles,
      team: teamId,
      categories: categoriesId,
    });

    return this.CredentialRepository.save(newCredential);
  }

  async findAll(fields: string[]) {
    const allowedRelations = ['team', 'categories'];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.CredentialRepository.createQueryBuilder('credential')
        .leftJoinAndSelect('credential.team', 'team')
        .leftJoinAndSelect('credential.categories', 'categories');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `credential.${column}`;
          }
        }),
      );
      const credential = await queryBuilder.getMany();
      return credential;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding credential ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findOne(id: number, fields: string[]) {
    const allowedRelations = ['team', 'categories'];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.CredentialRepository.createQueryBuilder('credential')
        .where('credential.id = :id', { id })
        .leftJoinAndSelect('credential.team', 'team')
        .leftJoinAndSelect('credential.categories', 'categories');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `credential.${column}`;
          }
        }),
      );
      const credential = await queryBuilder.getOne();
      return credential;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding credential ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async checkLoggedIn(req: any) {
    const cookie = req.cookies['__user'];

    if (!cookie) {
      throw new HttpException('User not logged In', HttpStatus.FORBIDDEN);
    }

    const token: JwtPayload = await this.LoginService.validateJwtToken(cookie);

    const username = token.username;

    if (!username) {
      throw new HttpException('User not logged In', HttpStatus.FORBIDDEN);
    }

    // find the user in the database
    const user = await this.findOneByUsername(username);

    if (!user) {
      throw new HttpException('User not logged In', HttpStatus.FORBIDDEN);
    }

    req.user = user;

    return user;
  }

  async findByTeam(team: string) {
    const teamId: Team = await this.teamService.findOneByName(team, ['id']);

    if (!teamId) {
      throw new HttpException('Team not found', HttpStatus.BAD_REQUEST);
    }

    try {
      const findOptions: FindOneOptions<Credential> = {
        where: {
          team: teamId,
        } as FindOptionsWhere<Team>,
        relations: ['team', 'categories'],
      };
      const credential = await this.CredentialRepository.find(findOptions);
      return credential;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding credential ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findByRole(roles: Roles) {
    try {
      const credential = this.CredentialRepository.find({
        where: {
          roles,
        },
      });

      return credential;
    } catch (err) {
      throw new HttpException(
        'An Error have when finding credential ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: err },
      );
    }
  }

  findOneByUsername(username: string) {
    return this.CredentialRepository.findOne({
      where: {
        username,
      },
      relations: ['team', 'categories'],
    });
  }

  async update(updateCredentialInput: UpdateCredentialInput, user: Credential) {
    let { id, categories, team, password, roles, username } = updateCredentialInput;

    const credential = await this.findOne(id, ['id']);

    const alreadyUser = await this.CredentialRepository.findOne({
      where: {
        username,
      },
    });
    if (alreadyUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const allCategories = await this.categoryService.findAll(['name']);
    const allCategoriesNames = allCategories.map(category => category.name);

    // the the users role and check if he is allowed to create a new user
    const userRole = user.roles;

    if (userRole === Roles.Admin) {
      // admin can create any user
      categories = allCategoriesNames;
    } else if (
      userRole === Roles.Controller &&
      this.checkCategoriesEquality(user.categories, allCategories)
    ) {
      roles = Roles.Controller;
      team = null;
    } else if (
      userRole === Roles.TeamManager &&
      this.checkCategoriesEquality(user.categories, allCategories)
    ) {
      team = user.team.name;
    } else {
      throw new HttpException('You are not allowed to create a new user', HttpStatus.UNAUTHORIZED);
    }

    let teamId = null;
    if (team) {
      teamId = await this.teamService.findOneByName(team, ['id']);
    }
    let categoriesId = null;
    if (categories) {
      categoriesId = await this.categoriesMapper(categories);
    }

    if (roles === (Roles.Controller || Roles.TeamManager) && !categoriesId) {
      throw new HttpException('You must select at least one category', HttpStatus.BAD_REQUEST);
    }

    if (roles === Roles.TeamManager && !teamId) {
      throw new HttpException('You must select a team', HttpStatus.BAD_REQUEST);
    }

    let hashedPassword = await this.LoginService.hashPassword(password);

    Object.assign(credential, {
      username,
      password: hashedPassword,
      roles,
      team: teamId,
      categories: categoriesId,
    });

    return this.CredentialRepository.save(credential);
  }

  async remove(id: number, user: Credential) {
    const credential: Credential = await this.findOne(id, ['id', 'roles']);
    if (!credential) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    let { roles } = credential;

    const allCategories: Category[] = await this.categoryService.findAll(['name']);

    // the the users role and check if he is allowed to create a new user
    const userRole = user.roles;

    if (userRole === Roles.Admin) {
      // admin can remove premium users only
      return this.CredentialRepository.delete(id);
    } else if (
      userRole === Roles.Controller &&
      this.checkCategoriesEquality(user.categories, allCategories) &&
      roles.includes(Roles.Controller)
    ) {
      return this.CredentialRepository.delete(id);
    } else if (
      userRole === Roles.TeamManager &&
      this.checkCategoriesEquality(user.categories, allCategories) &&
      roles.includes(Roles.TeamManager)
    ) {
      return this.CredentialRepository.delete(id);
    } else {
      throw new HttpException('You are not allowed to remove this user', HttpStatus.UNAUTHORIZED);
      return null;
    }
  }

  async categoriesMapper(categories: string[]) {
    const FindedCategories: Category[] = [];
    for (const category of categories) {
      const FindedCategory = await this.categoryService.findOneByName(category);
      FindedCategories.push(FindedCategory);
    }

    return FindedCategories;
  }

  checkCategoriesEquality(categoryOne: any, categoryTwo: any) {
    if (categoryOne.length !== categoryTwo.length) {
      return false; // Arrays have different lengths, not equal
    }

    const names1 = categoryOne.map(obj => obj.name).sort();
    const names2 = categoryTwo.map(obj => obj.name).sort();

    for (let i = 0; i < names1.length; i++) {
      if (names1[i] !== names2[i]) {
        return false; // Names at corresponding index are not equal
      }
    }

    return true; // All objects have equal names
  }

  async checkPermissionOnCategories(user: Credential, categoryName: string) {
    // authenticating the user have permission to update the category

    const categoryExists = user.categories?.some(category => category.name === categoryName);

    if (!categoryExists) {
      throw new HttpException(
        `You don't have permission to access the category ${categoryName} `,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async checkPermissionOnCategoriesWithouError(user: Credential, categoryName: string) {
    // authenticating the user have permission to update the category
    const categoryExists = user.categories?.some(category => category.name === categoryName);

    if (!categoryExists) {
      return false;
    }

    return true;
  }

  async checkPermissionOnTeam(user: Credential, teamName: string) {
    const teamExists = user.team?.name === teamName;

    if (!teamExists) {
      throw new HttpException(
        `You don't have permission to access the team ${teamName} `,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // checking the api key
  async ValidateApiKey(apiKey: string) {
  // check the given api is as on the env file
    if (apiKey !== process.env.API_KEY) {
      throw new HttpException('😬😬 You are not allowed to perform this!', HttpStatus.UNAUTHORIZED);
    }
  }

  async checkPermissionOnTeamWithouError(user: Credential, teamName: string) {
    const teamExists = user.team?.name === teamName;

    if (!teamExists) {
      return false;
    }

    return true;
  }
  
} 
 

import { HttpException, HttpStatus, Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credential } from '../entities/credential.entity';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../jwt/jwt.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(Credential) private CredentialRepository: Repository<Credential>,
    private readonly jwtService: JwtService
  ) {}

  async verifyUser(username: string) {
    const user = await this.CredentialRepository.findOne({
      where: {
        username,
      },
    });
    if (user) {
      return user;
    }
    return null;
  }

  async login(username: string, password: string) {
    const user = await this.CredentialRepository.findOne({
      where: {
        username,
      },
      relations: ['team', 'categories'],
    });

    if (!user) {
      throw new HttpException('Invalid Username ', HttpStatus.BAD_REQUEST);
    }

    if (user) {
      const isPasswordValid = await this.comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new HttpException('Invalid Password ', HttpStatus.BAD_REQUEST);
      }


      if (isPasswordValid) {
        const payload: JwtPayload = {
          username: user.username,
          sub: user.id,
          roles: user.roles,
          team: user.team?.name,
          categories: user.categories?.map(category => category.name),
        };
        
        const token = await this.generateJwtToken(payload);



        return {
          admin : user,
          token,
        };
      }
    }

    return null;
  }

  // hashing the password
  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    // hash the password with bcrypt
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  // compare password
  async comparePassword(password: string, hash: string) {
    // compare password with bcrypt
    const result = await bcrypt.compare(password, hash);
    return result;
  }

  // generate JWT token
  async generateJwtToken(user: JwtPayload) {
    
    const token = this.jwtService.sign(user);
    return token;
  }

  // validate JWT token
  async validateJwtToken(token: string) {
    const result = await this.jwtService.verify(token);
    return result;
  }

  // decode JWT token
  async decodeJwtToken(token: string) {
    const result = await this.jwtService.decode(token);
    return result;
  }

}

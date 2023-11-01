import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../entities/skill.entity';

@Injectable()
export class AuthPipe implements PipeTransform {
  constructor(@InjectRepository(Skill) private Repository: Repository<Skill>) {

  }
  async transform(value: any, metadata: ArgumentMetadata) {

    let { name } = value
    const user = await this.Repository.findOne({
      where: {
        name,
      },
    })
    if (user) {
      console.log('Skill already exists');

      throw new HttpException("Skill already exists", HttpStatus.BAD_REQUEST);

    }

    return value;
  }
}

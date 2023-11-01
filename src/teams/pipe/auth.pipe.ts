import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../entities/team.entity';

@Injectable()
export class AuthPipe implements PipeTransform {
  constructor(@InjectRepository(Team) private Repository: Repository<Team>) {

  }
  async transform(value: any, metadata: ArgumentMetadata) {

    let { name } = value
    const user = await this.Repository.findOne({
      where: {
        name,
      },
    })
    if (user) {
      console.log('Team already exists');

      throw new HttpException("Team already exists", HttpStatus.BAD_REQUEST);

    }

    return value;
  }
}

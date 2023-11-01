import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from '../entities/grade.entity';

@Injectable()
export class AuthPipe implements PipeTransform {
  constructor(@InjectRepository(Grade) private Repository: Repository<Grade>) {}
  async transform(value: any, metadata: ArgumentMetadata) {
    let { name } = value;
    const user = await this.Repository.findOne({
      where: {
        name,
      },
    });
    if (user) {
      console.log('Candidate already exists');

      throw new HttpException('Candidate already exists', HttpStatus.BAD_REQUEST);
    }

    return value;
  }
}

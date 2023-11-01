import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from '../entities/position.entity';

@Injectable()
export class AuthPipe implements PipeTransform {
  constructor(@InjectRepository(Position) private Repository: Repository<Position>) {}
  async transform(value: any, metadata: ArgumentMetadata) {
    let { name } = value;
    const user = await this.Repository.findOne({
      where: {
        name,
      },
    });
    if (user) {
      console.log('Position already exists');

      throw new HttpException('Position already exists', HttpStatus.BAD_REQUEST);
    }

    return value;
  }
}

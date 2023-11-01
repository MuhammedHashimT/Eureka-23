import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Programme } from '../entities/programme.entity';

@Injectable()
export class AuthPipe implements PipeTransform {
  constructor(@InjectRepository(Programme) private Repository: Repository<Programme>) {}
  async transform(value: any, metadata: ArgumentMetadata) {
    let { programCode } = value;
    const user = await this.Repository.findOne({
      where: {
        programCode,
      },
    });
    if (user) {
      console.log('Programme code already exists');

      throw new HttpException('Programme code already exists', HttpStatus.BAD_REQUEST);
    }

    return value;
  }
}

import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from '../entities/section.entity';

@Injectable()
export class AuthPipe implements PipeTransform {
  constructor(@InjectRepository(Section) private Repository: Repository<Section>) {}
  async transform(value: any, metadata: ArgumentMetadata) {
    let { name } = value;
    const user = await this.Repository.findOne({
      where: {
        name,
      },
    });
    if (user) {
      console.log('Section already exists');

      throw new HttpException('Section already exists', HttpStatus.BAD_REQUEST);
    }

    return value;
  }
}

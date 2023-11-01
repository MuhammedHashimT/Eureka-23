import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryPipe implements PipeTransform {
  constructor(@InjectRepository(Category) private Repository: Repository<Category>) {}
  async transform(value: any, metadata: ArgumentMetadata) {
    let { name } = value;
    const user = await this.Repository.findOne({
      where: {
        name,
      },
    });
    if (user) {
      console.log('Category already exists');

      throw new HttpException('Category already exists', HttpStatus.BAD_REQUEST);
    }

    return value;
  }
}

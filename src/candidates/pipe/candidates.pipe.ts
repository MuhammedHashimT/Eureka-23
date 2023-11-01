import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../entities/candidate.entity';
import { CreateCandidateInput } from '../dto/create-candidate.input';

@Injectable()
export class CandidatePipe implements PipeTransform {
  constructor(@InjectRepository(Candidate) private Repository: Repository<Candidate>) {

  }
  async transform(value: CreateCandidateInput, metadata: ArgumentMetadata) {

    let { chestNO } = value
    console.log(value.chestNO);

    const user = await this.Repository.findOne({
      where: {
        chestNO: value.chestNO,
      },
    })
    if (user) {
      // console.log(user);

      console.log('Candidate already exists');

      throw new HttpException("Candidate already exists", HttpStatus.BAD_REQUEST);

    }

    return value;
  }
}

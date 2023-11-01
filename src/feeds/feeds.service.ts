import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFeedInput } from './dto/create-feed.input';
import { UpdateFeedInput } from './dto/update-feed.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Feed } from './entities/feed.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FeedsService {

  constructor(
    @InjectRepository(Feed)
    private feedRepository: Repository<Feed>,
  ) {}

  create(createFeedInput: CreateFeedInput) {
    try {
      const feed = this.feedRepository.create(createFeedInput);
      return this.feedRepository.save(feed);
    }
    catch (error) {
      throw new HttpException("Error on creating Feed", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  findAll() {
    try {
      return this.feedRepository.find();
    }
    catch (error) {
      throw new HttpException("Error on fetching Feeds", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  findOne(id: number) {
    try {
      return this.feedRepository.findOne({
        where: {
          id: id
        }
      });
    }
    catch (error) {
      throw new HttpException("Error on fetching Feed", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

 async update(id: number, updateFeedInput: UpdateFeedInput) {

    const feed = await this.findOne(id)
    Object.assign(feed,updateFeedInput)
    try {
      
      return this.feedRepository.save(feed);
    }
    catch (error) {
      throw new HttpException("Error on updating Feed", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  remove(id: number) {
    try {
      return this.feedRepository.delete({
        id: id
      });
    }
    catch (error) {
      throw new HttpException("Error on deleting Feed", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

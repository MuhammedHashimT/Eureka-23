import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Gallery } from './entities/gallery.entity';
import { Repository } from 'typeorm';
import { driveConfig } from '../utils/googleApi.auth';
import { Readable } from 'typeorm/platform/PlatformTools';
import { TagService } from 'src/tag/tag.service';

@Injectable()
export class GalleryService {

  constructor(
    @InjectRepository(Gallery)
    private galleryRepository: Repository<Gallery>,
    @Inject(forwardRef(() => TagService))
    private readonly tagService: TagService,
  ) { }

  async create(createGalleryDto: CreateGalleryDto, file: Express.Multer.File) {

    // check the each tag is exist

    const gallery = this.galleryRepository.create(createGalleryDto);
    const imageId = await this.uploadFile(file.buffer, file.originalname, file.mimetype);
    gallery.imageId = imageId;



    try {
      const Gallery = await this.galleryRepository.save(gallery);

      return Gallery;
    }
    catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createMany( files: Express.Multer.File[]) {
    // upload files 
    const imageIds = await Promise.all(files.map(async (file) => {
      const imageId = await this.uploadFile(file.buffer, file.originalname, file.mimetype);
      return imageId;
    }))

    // after upload files, create gallery
    const galleries = files.map((gallery, index) => {
      return this.galleryRepository.create({
        name: gallery.originalname,
        imageId: imageIds[index],
      });
    })

    try {
      return await this.galleryRepository.save(galleries);
    }
    catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  async findAll() {
    try {
      const gallery: Gallery[] = await this.galleryRepository.find();

      return gallery;
    }
    catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  findOne(id: number) {
    try {
      return this.galleryRepository.findOne({
        where: { id },
      });
    }
    catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: number, updateGalleryDto: UpdateGalleryDto, file: Express.Multer.File) {
    const gallery = await this.findOne(id)
    const imageId: string = await this.uploadFile(file.buffer, file.originalname, file.mimetype)

    const tags = await Promise.all(updateGalleryDto.tag.map(async (tag) => {
      const _tag = await this.tagService.findByName(tag);
      if (_tag) {
        return _tag;
      }
      else {
        throw new HttpException(`tag ${tag} is not exist`, HttpStatus.BAD_REQUEST);
      }
    }))

    try {
      gallery.name = updateGalleryDto.name;
      const Gallery = await this.galleryRepository.save({
        ...gallery,
        imageId,
      });

      tags.forEach(async (tag) => {
        await tag.galleries.push(Gallery);
        await this.tagService.addGallery(tag.id, Gallery.id);
      })

      return Gallery;
    }
    catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  remove(id: number) {
    try {
      return this.galleryRepository.delete(id);
    }
    catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async uploadFile(filePath: Buffer, fileName: string, mimeType: string) {

    // check the file is image
    if (!mimeType.includes('image')) {
      throw new HttpException(`File is not an image`, HttpStatus.BAD_REQUEST);
    }

    // change the file path to buffer
    const buffer = Buffer.from(filePath);

    // change the buffer to readable stream
    const readableStream = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      },
    });

    // Get the file extension.
    const fileExtension = fileName.split('.')[1];

    // get the folder id
    const folderId = process.env.DRIVE_GALLERY_FOLDER_ID;

    try {
      // driveConfig
      const drive = driveConfig();

      const response = await drive.files.create({
        requestBody: {
          name: `${fileName}.${fileExtension}`, //file name
          mimeType,
          parents: folderId ? [folderId] : [],
        },
        media: {
          mimeType,
          body: readableStream,
        },
      });
      // report the response from the request
      return response.data.id;
    } catch (error) {
      //report the error message
      throw new HttpException(
        `Error on google drive upload , check the image of ${fileName}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

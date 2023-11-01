import { Body, Controller, Param, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CandidatesService } from './candidates.service';


@Controller('candidates')
export class CandidatesController {
  constructor(
    private readonly candidatesService: CandidatesService,
  ) 
  {}

  // upload image
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body('chestNo') chestNo: string) {
    return this.candidatesService.uploadFile(chestNo, file.buffer, file.originalname, file.mimetype);
  }

  // upload multiple images 
  // neet to get array of files
  @Post('uploadMultiple')
  @UseInterceptors(FilesInterceptor('files',null))
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[] ) {
    
    return this.candidatesService.uploadFiles( files);
  }

  
}

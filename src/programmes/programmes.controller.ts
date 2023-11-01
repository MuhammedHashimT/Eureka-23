import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProgrammesService } from './programmes.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateProgrammeInput } from './dto/create-programme.input';
import { CreateSchedule } from './dto/create-schedule.dto';

@Controller('programmes')
export class ProgrammesController {
  // constructor(
  //   private readonly programmeService: ProgrammesService
  // ) {
  // }
  // @Post('upload')
  // @UseInterceptors(FileInterceptor('file'))
  // uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   const wb = read(file.buffer, { type: 'buffer' });
  //   console.log(wb.SheetNames);
  //   // taking first worksheet from workbook to read data
  //   const ws = wb.Sheets[wb.SheetNames[0]];
  //   const values: CreateProgrammeInput[] = utils.sheet_to_json(ws)
  //   console.log(values);
  //   // returning to service page
  //   // return this.programmeService.createMany(values,)
  // }
  // @Post('schedule')
  // @UseInterceptors(FileInterceptor('file'))
  // scheduleFile(@UploadedFile() file: Express.Multer.File) {
  //   const wb = read(file.buffer, { type: 'buffer' });
  //   console.log(wb.SheetNames);
  //   // taking first worksheet from workbook to read data
  //   const ws = wb.Sheets[wb.SheetNames[0]];
  //   const values: CreateSchedule[] = utils.sheet_to_json(ws)
  //   // change the time column to date with time column with xlxs
  //   values.forEach((value: CreateSchedule) => {
  //     value.date = new Date(value.date)
  //   })
  //   console.log(values);
  //   // returning to service page
  //   return this.programmeService.setManySchedule(values)
  // }
}

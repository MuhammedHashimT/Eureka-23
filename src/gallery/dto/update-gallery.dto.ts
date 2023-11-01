import { PartialType } from '@nestjs/mapped-types';
import { CreateGalleryDto } from './create-gallery.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateGalleryDto extends PartialType(CreateGalleryDto) {
    @IsNotEmpty()
    @IsNumber()
    id : number;
}

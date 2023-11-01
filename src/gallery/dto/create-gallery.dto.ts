import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateGalleryDto {
    @IsNotEmpty()
    @IsString()
    name: string;
  
    @IsNotEmpty()
    @IsString({ each: true })
    tag: [string];
}

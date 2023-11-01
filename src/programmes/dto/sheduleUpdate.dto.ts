import { InputType, Field } from '@nestjs/graphql';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { updateSchedule } from './update-schedule.dto';

@InputType()
export class ScheduleUpdate {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => updateSchedule)
  @Field(() => [updateSchedule])
  inputs: updateSchedule[];
}

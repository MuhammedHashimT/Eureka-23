import { InputType, Field } from '@nestjs/graphql';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSchedule } from './create-schedule.dto';

@InputType()
export class ScheduleCreate {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSchedule)
  @Field(() => [CreateSchedule])
  inputs: CreateSchedule[];
}

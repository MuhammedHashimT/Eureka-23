import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateSchedule } from './create-schedule.dto';

@InputType()
export class updateSchedule extends PartialType(CreateSchedule) {
  @Field(() => Int)
  id: number;
}

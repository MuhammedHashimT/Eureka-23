import { IsNotEmpty } from 'class-validator';
import { Field, InputType, Int} from '@nestjs/graphql';

@InputType()
export class CreateSchedule {
    @Field()
    @IsNotEmpty()
    code:string

    @Field(()=>Date)
    @IsNotEmpty()
    date:Date

    @Field(()=>Int,{nullable:true})
    venue : number
}

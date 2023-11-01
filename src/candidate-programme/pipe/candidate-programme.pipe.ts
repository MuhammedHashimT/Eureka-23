import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateProgramme } from '../entities/candidate-programme.entity';
import { CreateCandidateProgrammeInput } from '../dto/create-candidate-programme.input';
import { CandidatesService } from 'src/candidates/candidates.service';
import { ProgrammesService } from 'src/programmes/programmes.service';
import { Candidate } from 'src/candidates/entities/candidate.entity';

@Injectable()
export class CandidateProgrammePipe implements PipeTransform {
  constructor(
    @InjectRepository(CandidateProgramme) private candidateProgrammeRepository: Repository<CandidateProgramme> ,
    private readonly candidateService:CandidatesService ,
    private readonly programmeService:ProgrammesService

    ) {

  }
  async transform(value: CreateCandidateProgrammeInput , metadata: ArgumentMetadata) {

    // checking is candidate exist
    let { chestNo , programme_code } = value

    let candidate : Candidate = await this.candidateService.findOneByChestNo(chestNo)

    if(!candidate){
      throw new HttpException(`Can't find candidate with chest number ${chestNo}`,HttpStatus.BAD_REQUEST)
    }

    // checking is programme exist

    let programme = await this.programmeService.findOneByCode(programme_code )

    if(!programme){
      throw new HttpException(`Can't find programme with programme id ${programme_code}` , HttpStatus.BAD_REQUEST)
    }

    // checking is candidate programme already exist for this candidate

    // initializing the programmes of specified candidate to a variable
    const candidateProgrammes : CandidateProgramme[] = candidate.candidateProgrammes

    // finding on his programmes
    const isAlreadyDone = candidateProgrammes.find((e:CandidateProgramme)=>{
     return  e.programme?.name === programme.name
    })

    if(isAlreadyDone){
      throw new HttpException(`Already Up to date , candidate ${candidate.name} is already in programme ${programme.name} `,HttpStatus.BAD_REQUEST)
    }

    return value;
  }
}

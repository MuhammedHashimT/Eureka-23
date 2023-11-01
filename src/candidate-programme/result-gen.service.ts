import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateProgramme } from './entities/candidate-programme.entity';
import { AddResult } from './dto/add-result.dto';
import { GradesService } from 'src/grades/grades.service';
import { Grade } from 'src/grades/entities/grade.entity';
import { PositionService } from 'src/position/position.service';
import { Position } from 'src/position/entities/position.entity';
import { CandidateProgrammeService } from './candidate-programme.service';
import { ProgrammesService } from 'src/programmes/programmes.service';
import { Model, Programme, Type } from 'src/programmes/entities/programme.entity';
import { DetailsService } from 'src/details/details.service';
import { arrayInput } from './dto/array-input.dto';
import { TeamsService } from 'src/teams/teams.service';
import { CandidatesService } from 'src/candidates/candidates.service';
import * as firebase from 'firebase/app';
import * as firebasedb from 'firebase/database';
import { AddManual } from './dto/add-manual.dto';

@Injectable()
export class ResultGenService {
  constructor(
    @InjectRepository(CandidateProgramme)
    private candidateProgrammeRepository: Repository<CandidateProgramme>,
    private readonly gradeService: GradesService,
    private readonly positionService: PositionService,
    private readonly candidateProgrammeService: CandidateProgrammeService,
    private readonly programmeService: ProgrammesService,
    private readonly DetailService: DetailsService,
    private readonly teamService: TeamsService,
    private readonly candidateService: CandidatesService,
  ) { }

  private firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  }; //by adding your credentials, you get authorized to read and write from the database

  private app = firebase.initializeApp(this.firebaseConfig);
  /**
   * Loading Firebase Database and referring
   * to user_data Object from the Database
   */
  private db = firebasedb.getDatabase(this.app);

  // upload Normal Result

  async addResult(programCode: string, input: arrayInput) {
    // check if programme exist

    const programme: Programme = await this.programmeService.findOneByCode(programCode);

    // all candidates of programme

    let candidatesOfProgramme: CandidateProgramme[] = programme.candidateProgramme;

    if (!programme) {
      throw new HttpException('Programme does not exist', HttpStatus.BAD_REQUEST);
    }

    // checking the programme is already published

    if (programme.resultPublished) {
      throw new HttpException('Programme is already published', HttpStatus.BAD_REQUEST);
    }

    // verify the result
    await this.verifyResult(input.inputs, programCode);

    for (let index = 0; index < programme.candidateProgramme.length; index++) {
      const candidate = candidatesOfProgramme[index];

      candidate.mark = input.inputs[index].mark
    }

    // process the result
    candidatesOfProgramme = await this.processResult(programme);
    try {
      await this.programmeService.enterResult(programCode);
      return this.candidateProgrammeRepository.save(candidatesOfProgramme);
    } catch (error) {
      throw new HttpException('Error on updating result', HttpStatus.BAD_REQUEST);
    }
  }

  // result upload process

  async processResult(programme: Programme) {
    // Clear the grade first before generating new one
    let candidatesOfProgramme: CandidateProgramme[] = programme.candidateProgramme;

    for (let index = 0; index < candidatesOfProgramme.length; index++) {
      const candidate = candidatesOfProgramme[index];
      candidate.grade = null;
    }

    //  Generating Grade for each candidate
    if (programme.model === Model.Arts) {
      for (let index = 0; index < candidatesOfProgramme.length; index++) {
        const candidate = candidatesOfProgramme[index];
        const grade: Grade = await this.generateGrade(candidate.mark, programme);
        candidate.grade = grade;
      }
    } else {
      for (let index = 0; index < candidatesOfProgramme.length; index++) {
        const candidate = candidatesOfProgramme[index];
        candidate.grade = null;
      }
    }
    // Generating Position for each candidate

    // Clear the position first before generating new one
    for (let index = 0; index < candidatesOfProgramme.length; index++) {
      const candidate = candidatesOfProgramme[index];
      candidate.position = null;
    }

    candidatesOfProgramme = await this.generatePosition(
      candidatesOfProgramme,
      programme.programCode,
    );

    // set the point for each candidate
    for (let index = 0; index < candidatesOfProgramme.length; index++) {
      let candidate = candidatesOfProgramme[index];
      candidate = await this.generatePoint(candidate);
    }

    return candidatesOfProgramme;
  }

  // verify the result

  async verifyResult(input: AddResult[], programCode: string) {

    // CHANGED SOME FOR DH HOUSING ONLY

    // all candidates of programme
    const candidatesOfProgramme: CandidateProgramme[] =
      await this.candidateProgrammeService.getCandidatesOfProgramme(programCode);

    // checking the two input ore equal

    const isSameLength = candidatesOfProgramme.length === input.length;

    // sorting data

    let sortedCandidateProgramme = candidatesOfProgramme.sort(
      (a: CandidateProgramme, b: CandidateProgramme) => {

        // here each chest no have 4 letters , fist one is letter and other 3 are numbers , so we are taking the last 3 numbers

        const chestNoA = parseInt(a.candidate?.chestNO.slice(1, 4));
        const chestNoB = parseInt(b.candidate?.chestNO.slice(1, 4));

        return chestNoA - chestNoB;
      },
    );

    const sortedInput = input.sort((a: AddResult, b: AddResult) => {

      // here each chest no have 4 letters , fist one is letter and other 3 are numbers , so we are taking the last 3 numbers

      const chestNoA = parseInt(a.chestNo.slice(1, 4));
      const chestNoB = parseInt(b.chestNo.slice(1, 4));

      return chestNoA - chestNoB;
    });

    if (!isSameLength) {
      throw new HttpException(
        `An error form of result upload , please check the result of all candidates of programme ${programCode} is uploaded`,
        HttpStatus.BAD_REQUEST,
      );
    } else {
      for (let index = 0; index < input.length; index++) {
        const input: AddResult = sortedInput[index];

        const cProgramme: CandidateProgramme = sortedCandidateProgramme[index];

        // checking is candidate have in this programme
        if (input?.chestNo != cProgramme.candidate?.chestNO) {
          throw new HttpException(
            `An error form of result upload , please check the candidate ${input.chestNo} is in programme ${programCode}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }
  }

  // verify the result mannualy

  async verifyResultManual(input: AddManual[], programCode: string) {

    // CHANGED SOME FOR DH HOUSING ONLY

    // all candidates of programme
    const candidatesOfProgramme: CandidateProgramme[] =
      await this.candidateProgrammeService.getCandidatesOfProgramme(programCode);

    // checking the two input ore equal

    const isSameLength = candidatesOfProgramme.length === input.length;

    // sorting data

    let sortedCandidateProgramme = candidatesOfProgramme.sort(
      (a: CandidateProgramme, b: CandidateProgramme) => {

        // here each chest no have 4 letters , fist one is letter and other 3 are numbers , so we are taking the last 3 numbers

        const chestNoA = parseInt(a.candidate?.chestNO.slice(1, 4));
        const chestNoB = parseInt(b.candidate?.chestNO.slice(1, 4));

        return chestNoA - chestNoB;
      },
    );

    const sortedInput = input.sort((a: AddManual, b: AddManual) => {

      // here each chest no have 4 letters , fist one is letter and other 3 are numbers , so we are taking the last 3 numbers

      const chestNoA = parseInt(a.chestNo.slice(1, 4));
      const chestNoB = parseInt(b.chestNo.slice(1, 4));

      return chestNoA - chestNoB;
    });

    if (!isSameLength) {
      throw new HttpException(
        `An error form of result upload , please check the result of all candidates of programme ${programCode} is uploaded`,
        HttpStatus.BAD_REQUEST,
      );
    } else {
      for (let index = 0; index < input.length; index++) {
        const input: AddManual = sortedInput[index];

        const cProgramme: CandidateProgramme = sortedCandidateProgramme[index];

        // checking is candidate have in this programme
        if (input?.chestNo != cProgramme.candidate?.chestNO) {
          throw new HttpException(
            `An error form of result upload , please check the candidate ${input.chestNo} is in programme ${programCode}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }
  }

  // generating grade

  async generateGrade(mark: number, programme: Programme) {
    const allGrades: Grade[] = await this.gradeService.findAll(['id', 'percentage']);
    // Descending sorting
    const sortedGrade: Grade[] = allGrades.sort((a: Grade, b: Grade) => {
      return b.percentage - a.percentage;
    });

    //  checking each grades percentage and the eligibility of the candidate
    for (let index = 0; index < sortedGrade.length; index++) {
      const grade: Grade = sortedGrade[index];
      if (mark >= (grade.percentage / 100) * programme.totalMark) {
        return grade;
      }
    }
    return null;
  }

  // generate position

  async generatePosition(CandidateProgramme: CandidateProgramme[], programCode: string) {
    const Positions: Position[] = await this.positionService.findAll([
      'id',
      'name',
      'pointSingle',
      'pointGroup',
      'pointHouse',
      'programme.id',
      'programme.type',
    ]);

    // giving the position

    CandidateProgramme = await this.multiplePosition(CandidateProgramme, Positions, programCode);

    return CandidateProgramme;
  }

  async multiplePosition(
    CandidateProgramme: CandidateProgramme[],
    Positions: Position[],
    programCode: string,
  ) {
    var totals = [];
    for (var i = 0; i < CandidateProgramme.length; i++) {
      var total = CandidateProgramme[i].mark;
      totals.push(total);
    }
    const sorted = [...new Set(totals)].sort((a, b) => b - a);
    const rank = new Map(sorted.map((x, i) => [x, i + 1]));
    const changed = totals.map(x => rank.get(x));

    // checking is there have multiple position
    if (this.containsDuplicates(changed, Positions.length)) {
      const isMultiplePositionAllowed: boolean = (await this.DetailService.findIt())
        .isMultipleResultAllowed; // || false;

      if (!isMultiplePositionAllowed) {
        await this.programmeService.setAnyIssue(programCode, true);
      }
    } else {
      await this.programmeService.setAnyIssue(programCode, false);
    }

    // giving the position
    for (let index = 0; index < CandidateProgramme.length; index++) {
      const candidateProgramme: CandidateProgramme = CandidateProgramme[index];
      const position: Position = Positions[changed[index] - 1];

      if (position) {
        candidateProgramme.position = position;
      }
    }

    return CandidateProgramme;
  }

  async generatePoint(CandidateProgramme: CandidateProgramme) {
    console.log(CandidateProgramme);

    // giving the point of grade
    const grade: Grade = CandidateProgramme.grade;

    CandidateProgramme.point = 0;

    if (grade) {
      const grageWithPoint = await this.gradeService.findOne(grade.id, ['id', 'name', 'pointSingle', 'pointGroup', 'pointHouse'])
      if (CandidateProgramme.programme.type == Type.SINGLE) {
        CandidateProgramme.point = grade.pointSingle;
        CandidateProgramme.point = grageWithPoint.pointSingle;
      } else if (CandidateProgramme.programme.type == Type.GROUP) {
        CandidateProgramme.point = grade.pointGroup;
        CandidateProgramme.point = grageWithPoint.pointGroup;
      } else if (CandidateProgramme.programme.type == Type.HOUSE) {
        CandidateProgramme.point = grade.pointHouse;
        CandidateProgramme.point = grageWithPoint.pointHouse;
      }
    }

    // giving the point of position
    const position: Position = CandidateProgramme.position;

    if (position) {
      if (CandidateProgramme.programme.type == Type.SINGLE) {
        CandidateProgramme.point += position.pointSingle;
      } else if (CandidateProgramme.programme.type == Type.GROUP) {
        CandidateProgramme.point += position.pointGroup;
      } else if (CandidateProgramme.programme.type == Type.HOUSE) {
        CandidateProgramme.point += position.pointHouse;
      }
    }

    return CandidateProgramme;
  }

  // checking as array contains duplicates
  containsDuplicates(array: number[], positionCount: number) {
    const allowedNumbers = [];
    for (let index = 1; index <= positionCount; index++) {
      allowedNumbers.push(index);
    }
    const encounteredNumbers = new Set();

    for (const num of array) {
      if (allowedNumbers.includes(num)) {
        if (encounteredNumbers.has(num)) {
          return true; // Found a duplicate of 1, 2, or 3
        } else {
          encounteredNumbers.add(num);
        }
      }
    }

    return false; // No duplicate of 1, 2, or 3 found
  }

  judgeResultCheck(
    input: AddResult[],
    candidateProgrammes: CandidateProgramme[],
    judgeName: string,
  ) {
    // SOME FOR DH HOUSING ONLY
    const sortedInput = input.sort((a: AddResult, b: AddResult) => {

      // here each chest no have 4 letters , fist one is letter and other 3 are numbers , so we are taking the last 3 numbers
      const aChestNo = parseInt(a.chestNo.slice(1, 4));
      const bChestNo = parseInt(b.chestNo.slice(1, 4));

      return aChestNo - bChestNo;
    });

    const sortedCandidateProgramme = candidateProgrammes.sort(
      (a: CandidateProgramme, b: CandidateProgramme) => {

        // here each chest no have 4 letters , fist one is letter and other 3 are numbers , so we are taking the last 3 numbers

        const aChestNo = parseInt(a.candidate.chestNO.slice(1, 4));
        const bChestNo = parseInt(b.candidate.chestNO.slice(1, 4));

        return aChestNo - bChestNo;
      },
    );

    for (let i = 0; i < sortedInput.length; i++) {
      const input = sortedInput[i];
      const candidateProgramme = sortedCandidateProgramme[i];

      if (input.chestNo != candidateProgramme.candidate.chestNO) {
        throw new HttpException(
          `Chest No ${input.chestNo} is not match with ${candidateProgramme.candidate.chestNO}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      candidateProgramme[judgeName] = input.mark;

      // save the candidate programme
      this.candidateProgrammeRepository.save(candidateProgramme);
    }

    return sortedCandidateProgramme;
  }

  async approveJudgeResult(programCode: string, judgeName: string) {
    // check if programme exist

    const programme: Programme = await this.programmeService.findOneByCode(programCode);

    if (!programme) {
      throw new HttpException('Programme does not exist', HttpStatus.BAD_REQUEST);
    }

    // checking the programme is already published

    if (programme.resultPublished) {
      throw new HttpException('Programme is already published', HttpStatus.BAD_REQUEST);
    }

    // check if judge name is correct format
    const regex = new RegExp(/^judge[1-7]$/);

    if (!regex.test(judgeName)) {
      throw new HttpException('Judge name is not in correct format', HttpStatus.BAD_REQUEST);
    }

    // all candidates of programme

    let candidatesOfProgrammes: CandidateProgramme[] = programme.candidateProgramme;

    // add the mark of judge to mark of candidate programme

    for (let index = 0; index < candidatesOfProgrammes.length; index++) {
      const candidateProgramme = candidatesOfProgrammes[index];

      if (!candidateProgramme[judgeName]) {
        throw new HttpException(
          `Judge ${judgeName} result is not uploaded`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (candidateProgramme.mark) {
        candidateProgramme.mark =
          ((candidateProgramme.mark + candidateProgramme[judgeName]) / 20) * 10;
      } else {
        candidateProgramme.mark = candidateProgramme[judgeName];
      }
    }

    // process the result
    candidatesOfProgrammes = await this.processResult(programme);

    // set null to judge result
    for (let index = 0; index < candidatesOfProgrammes.length; index++) {
      const candidateProgramme = candidatesOfProgrammes[index];
      candidateProgramme[judgeName] = null;
    }

    try {
      await this.programmeService.enterResult(programCode);
      return this.candidateProgrammeRepository.save(candidatesOfProgrammes);
    } catch (error) {
      throw new HttpException('Error on updating result', HttpStatus.BAD_REQUEST);
    }
  }

  async publishResult(programCode: string) {
    // checking the programme exist

    const programme: Programme = await this.programmeService.findOneByCode(programCode);

    if (!programme) {
      throw new HttpException('Programme does not exist', HttpStatus.BAD_REQUEST);
    }

    // checking the programme is already published

    if (programme.resultPublished) {
      throw new HttpException('Programme is already published', HttpStatus.BAD_REQUEST);
    }

    // checking the programme have any issue

    if (programme.anyIssue) {
      throw new HttpException(
        `Programme ${programCode} is having an issue`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // checking the the result is added to the programme

    if (!programme.resultEntered) {
      throw new HttpException(
        `Programme ${programCode} is not having any result`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // add the point to total point of candidate's team

    const candidatesOfProgramme: CandidateProgramme[] = programme.candidateProgramme;

    for (let index = 0; index < candidatesOfProgramme.length; index++) {
      const candidateProgramme = candidatesOfProgramme[index];

      let Hpoint = 0;
      let Gpoint = 0;
      let Ipoint = 0;

      let ICpoint = 0;
      let GCpoint = 0;

      if (candidateProgramme.programme.type == Type.HOUSE) {
        Hpoint = candidateProgramme.point;
      } else if (candidateProgramme.programme.type == Type.GROUP) {
        Gpoint = candidateProgramme.point;
        GCpoint = candidateProgramme.point;
      } else if (candidateProgramme.programme.type == Type.SINGLE) {
        Ipoint = candidateProgramme.point;
        ICpoint = candidateProgramme.point;
      }

      if (candidateProgramme.candidate.team) {
        await this.teamService.setTeamPoint(
          candidateProgramme.candidate.team.id,
          candidateProgramme.point,
          Gpoint,
          Ipoint,
          Hpoint,
          candidateProgramme.programme.model,
        );
      }

      // set the point to candidate

      await this.candidateService.addPoint(candidateProgramme.candidate.id, ICpoint, GCpoint, candidateProgramme.programme.model);
    }

    // set the result published to true

    this.programmeService.publishResult(programCode);

    return programme;
  }

  async publishResults(programCode: [string]) {
    let data = []
    for (let index = 0; index < programCode.length; index++) {
      const program = programCode[index];
      let programme = await this.publishResult(program);
      data.push(programme)
    }

    return data;
  }

  // live result using firebase
  async liveResult(programCode: [string], timeInSec: number) {
    // Array of programmes

    const programmes: Programme[] = [];

    // checking the programme exist

    for (let index = 0; index < programCode.length; index++) {
      const program = programCode[index];
      const programme: Programme = await this.programmeService.findOneByCode(program);

      if (!programme) {
        throw new HttpException('Programme does not exist', HttpStatus.BAD_REQUEST);
      }

      // checking the programme is already published

      if (programme.resultPublished) {
        throw new HttpException(
          `Programme ${program} is already published`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // checking the programme have any issue

      if (programme.anyIssue) {
        throw new HttpException(`Programme ${program} is having an issue`, HttpStatus.BAD_REQUEST);
      }

      // checking the the result is added to the programme

      if (!programme.resultEntered) {
        throw new HttpException(
          `Programme ${program} is not having any result`,
          HttpStatus.BAD_REQUEST,
        );
      }

      programmes.push(programme);
    }

    var datas = programmes;

    let count = 0;

    var dat = {
      '/main': datas,
    };
    firebasedb.update(firebasedb.ref(this.db), dat);
    var datList;
    firebasedb
      .get(firebasedb.child(firebasedb.ref(this.db), 'main'))
      .then(snapshot => {
        if (snapshot.exists()) {
          datList = snapshot.val();
        } else {
          console.log('No data available');
        }
      })
      .catch(error => {
        throw new HttpException('Error on Live Result', HttpStatus.BAD_REQUEST);
      });

    var ref = firebasedb.ref(this.db, 'current');

    const intervalId = setInterval(() => {
      firebasedb
        .get(ref)
        .then(snapshot => {
          if (snapshot.exists()) {
            console.log(snapshot.val());
          } else {
            console.log('No data available');
          }
        })
        .catch(error => {
          throw new HttpException('Error on Live Result', HttpStatus.BAD_REQUEST);
        });
      datList[count]['startTime'] = new Date().getTime();
      datList[count]['time'] = timeInSec;
      var upo = {
        '/current': datList[count],
      };
      firebasedb.update(firebasedb.ref(this.db), upo);

      count++;

     if (count === datList.length) {
    console.log("stopped");
    clearInterval(intervalId);
    setTimeout(() => {
      firebasedb.update(firebasedb.ref(this.db), {
        "/current": "congratulations",
      });
    }, timeInSec * 1000);
    setTimeout(() => {
      firebasedb.update(firebasedb.ref(this.db), { "/current": "no data" });
    }, 10000);
  }
    }, timeInSec * 1000);
    return 0
  }

  // upload result mannualy by controller
  async uploadResultManually(programCode: string, input: AddManual[]) {

    // check if programme exist

    const programme: Programme = await this.programmeService.findOneByCode(programCode);

    // all candidates of programme

    let candidatesOfProgramme: CandidateProgramme[] = programme.candidateProgramme;

    if (!programme) {
      throw new HttpException('Programme does not exist', HttpStatus.BAD_REQUEST);
    }

    // checking the programme is already published

    if (programme.resultPublished) {
      throw new HttpException('Programme is already published', HttpStatus.BAD_REQUEST);
    }

    // verify the result

    await this.verifyResultManual(input, programme.programCode);

    // giving grade to each candidate

    // sort the input

    const sortedInput = input.sort((a: AddManual, b: AddManual) => {

      // here each chest no have 4 letters , fist one is letter and other 3 are numbers , so we are taking the last 3 numbers

      const chestNoA = parseInt(a.chestNo.slice(1, 4));
      const chestNoB = parseInt(b.chestNo.slice(1, 4));

      return chestNoA - chestNoB;
    });

    // sort the candidate programme

    const sortedCandidateProgramme = candidatesOfProgramme.sort(
      (a: CandidateProgramme, b: CandidateProgramme) => {

        // here each chest no have 4 letters , fist one is letter and other 3 are numbers , so we are taking the last 3 numbers

        const chestNoA = parseInt(a.candidate?.chestNO.slice(1, 4));
        const chestNoB = parseInt(b.candidate?.chestNO.slice(1, 4));

        return chestNoA - chestNoB;
      },
    );

    // mapping the candidates and input

    for (let index = 0; index < sortedInput.length; index++) {
      const input: AddManual = sortedInput[index];
      const candidateProgramme: CandidateProgramme = sortedCandidateProgramme[index];

      let mark = 0;
      candidateProgramme.grade = null;
      if (input.grade) {
        const grade: Grade = await this.gradeService.findOneByName(input.grade, ['id', 'pointSingle', 'pointGroup', 'pointHouse', 'percentage']);

        if (grade) {
          candidateProgramme.grade = grade;

          // calculating the mark
          if (programme.type == Type.SINGLE) {
            mark = grade.pointSingle
          }
          else if (programme.type == Type.GROUP) {
            mark = grade.pointGroup
          }
          else if (programme.type == Type.HOUSE) {
            mark = grade.pointHouse
          }
        }


      }

      candidateProgramme.position = null;

      if (input.position) {
        const position: Position = await this.positionService.findOneByName(input.position, ['id', 'pointSingle', 'pointGroup', 'pointHouse', 'name']);

        if (position) {
          candidateProgramme.position = position;

          // calculating the mark

          if (programme.type == Type.SINGLE) {
            mark += position.pointSingle
          }
          else if (programme.type == Type.GROUP) {
            mark += position.pointGroup
          }
          else if (programme.type == Type.HOUSE) {
            mark += position.pointHouse
          }
        }

      }


      candidateProgramme.point = mark;

      // save the candidate programme

      await this.candidateProgrammeRepository.save(candidateProgramme);

    }

    // make the programme result entered

    const updatedResult = await this.programmeService.enterResult(programCode);

    return programme;

  }

}

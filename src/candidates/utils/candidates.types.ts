import { Team } from "src/teams/entities/team.entity";
import { Gender } from "../entities/candidate.entity";
import { Section } from "src/sections/entities/section.entity";
import { Category } from "src/category/entities/category.entity";

export type createCandidateType = {

  name: string;

  class: number;

  adno: number;


  dob: string;

  chestNO: number;

  gender: Gender;

  team_id: number;

  section_id: number;

  category_id: number;
}

export type updateCandidate = {
  id: number;
}
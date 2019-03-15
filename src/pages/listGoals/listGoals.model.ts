//import { String } from "aws-sdk/clients/lexruntime";

export class ListGoals {
  recordid: number;
  version: number;
  goalname: string;
  goaltype: string;
  goalnumber:number;
  goalunit: number;
  goalunitvalue: string;
  daysperweek: number;
  daysperweekvalue: number;
  reward: string;
  rewardtiming: number;
  rewardtimingvalue: string;
  active: string;
  profileid: number;
  userid: number;
  weeks: Array<ListGoalWeeks>;
}
export class ListGoalWeeks {
  recordid: number;
  week_start: string;
  week_end:string;
  days_met:number;
  days: Array<ListGoalDays>;
}
export class ListGoalDays {
  recordid: number;
  day: string;
  total:number;
  daily_goal_met:string;
}
export class ListGoalsModel {
  items: Array<ListGoals>;
}

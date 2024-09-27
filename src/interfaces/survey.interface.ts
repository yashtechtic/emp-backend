import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface ISurveyDetail {
  surveyId: number;
  surveyTitle: string;
  status: string;
  addedDate: Date;
  modifiedDate: Date;
  addedBy: number;
  updatedBy: number;
  isDeleted: number;
  questions: ISurveyQuestion[];
}

export interface ISurveyQuestion {
  surveyQuestionId: number;
  question: string;
  questionType: string;
  addedDate: Date;
  options: ISurveyQuestionOption[];
}

export interface ISurveyQuestionOption {
  optionId: number;
  option: string;
}

export interface ISurveyList {
  paging: ISettingsParams;
  data: ISurveyDetail[];
}

export interface ISurveyAutoComplete {
  surveyId: number;
  surveyTitle: string;
}

export interface ISurveyRecord {
  surveyId: number;
}

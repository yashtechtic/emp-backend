import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface IAssessmentDetail {
  assessmentId: number;
  assessmentTitle: string;
  status: string;
  addedDate: Date;
  modifiedDate: Date;
  addedBy: number;
  updatedBy: number;
  isDeleted: number;
  questions: IAssessmentQuestionDetail[];
}

export interface IAssessmentQuestionDetail {
  assessmentQuestionId: number;
  question: string;
  questionType: string;
  addedDate: Date;
  options: IAssessmentQuestionOptionDetail[];
}

export interface IAssessmentQuestionOptionDetail {
  optionId: number;
  optionData: string;
}

export interface IAssessmentList {
  paging: ISettingsParams;
  data: IAssessmentDetail[];
}

export interface IAssessmentAutoComplete {
  assessmentId: number;
  assessmentTitle: string;
}

export interface IAssessmentRecord {
  assessmentId: number;
}

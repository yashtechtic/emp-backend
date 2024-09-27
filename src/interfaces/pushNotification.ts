import { Condition, Status } from '@app/common-config/dto/common.dto';
import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface IPushNotifyDetail {
  pushTemplateId: number;
  templateTitle: string;
  templateCode: string;
  title?: string;
  message: string;
  sound?: string;
  silent?: Condition;
  variables?: string;
  status: Status;
}

export interface IPushNotifyList {
  paging: ISettingsParams;
  data: IPushNotifyDetail[];
}

export interface IPushNotifyAutoComplete {
  pushTemplateId: number;
  templateTitle: string;
}

export interface IPushNotifyRecord {
  pushTemplateId: number;
}

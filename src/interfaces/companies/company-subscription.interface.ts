export interface ISubscription {
  subscriptionId: number;
  planName: string;
  planCode: string;
  monthlyPlan: number;
  yearlyPlan: number;
  status: string;
  addedDate: Date;
  modifiedDate: Date;
  isDefault: number;
  isDeleted: boolean;
}

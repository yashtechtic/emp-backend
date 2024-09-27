import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { InsertResult, Repository, UpdateResult } from 'typeorm';
import { ISubscription } from '@app/interfaces/companies/company-subscription.interface';
import { ISubscriptionRecord } from '@app/interfaces/subscription.interface';
import { Status } from '@app/common-config/dto/common.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>
  ) {}

  subscriptionDetail(value: any): Promise<ISubscription> {
    const details = this.subscriptionRepository
      .createQueryBuilder('s')
      .select([
        's.subscriptionId as subscriptionId',
        's.planName as planName',
        's.planCode as planCode',
        's.rates as rates',
        's.price as price',
        's.overview as overview',
        's.featureDetails as featureDetails',
        's.status as status',
        's.isDeleted as isDeleted',
      ])
      .where({ subscriptionId: value });
    return details.getRawOne();
  }

  checksubscriptionDetail(
    planCode: string,
    id?: number
  ): Promise<ISubscriptionRecord> {
    const subscriptionDetailsData = this.subscriptionRepository
      .createQueryBuilder('s')
      .select(['s.subscriptionId as subscriptionId'])
      .where({ planCode });

    if (id) {
      subscriptionDetailsData.andWhere('s.subscriptionId !=  :id', { id });
    }
    return subscriptionDetailsData.getRawOne();
  }

  createSubscription(subscriptionData: Subscription): Promise<InsertResult> {
    return this.subscriptionRepository
      .createQueryBuilder()
      .insert()
      .into(Subscription)
      .values(subscriptionData)
      .execute();
  }

  updateSubscription(
    id: number,
    subscriptionData: Subscription
  ): Promise<UpdateResult> {
    return this.subscriptionRepository
      .createQueryBuilder()
      .update(Subscription)
      .set(subscriptionData)
      .where('subscriptionId = :id', { id })
      .execute();
  }

  getAllSubscription(): Promise<ISubscription[]> {
    const subscriptionData = this.subscriptionRepository
      .createQueryBuilder('s')
      .select([
        's.subscriptionId as subscriptionId',
        's.planName as planName',
        's.planCode as planCode',
        's.rates as rates',
        's.price as price',
        's.overview as overview',
        's.featureDetails as featureDetails',
        's.status as status',
        's.isDeleted as isDeleted',
      ]);

    return subscriptionData.getRawMany();
  }

  deleteSubscription(id: number): Promise<UpdateResult> {
    return this.subscriptionRepository
      .createQueryBuilder()
      .update(Subscription)
      .set({ status: Status.Inactive, isDeleted: true })
      .where('subscriptionId = :id', { id })
      .execute();
  }
}

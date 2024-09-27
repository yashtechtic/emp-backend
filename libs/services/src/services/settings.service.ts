import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { config } from '../../../utilities/src/config';
import { Settings } from '@app/modules/settings/entities/setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private settingRepository: Repository<Settings>
  ) {}

  getItem = async (key: string) => {
    let val: any;
    if (key) {
      val = await this.settings(key);
      if (key in config.dynamic && val === '') {
        val = config.dynamic[key];
      } else if (key in config.static && val === '') {
        val = config.static[key];
      }
    }
    return val;
  };

  async settings(code: string, type?: string) {
    const setting = await this.settingRepository
      .createQueryBuilder('ms')
      .select(['ms.value as value'])
      .where({
        name: code,
      })
      .getRawOne();
    return setting ? setting.value : '';
  }
}

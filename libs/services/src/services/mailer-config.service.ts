import { Injectable } from '@nestjs/common';
import { MailerOptionsFactory } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Settings } from '@app/modules/settings/entities/setting.entity';

@Injectable()
export class MailerConfig implements MailerOptionsFactory {
  constructor(
    @InjectRepository(Settings)
    private settingRepository: Repository<Settings>
  ) {}

  async getSettingsItem() {
    try {
      const settingsDetail = await this.settingRepository
        .createQueryBuilder('ms')
        .select(['ms.name as name', 'ms.value as value'])
        .where('ms.name IN (:...name)', {
          name: [
            'NOTIFICATION_EMAIL',
            'USE_SMTP_ENABLED',
            'USE_SMTP_SERVERHOST',
            'USE_SMTP_SERVERPORT',
            'USE_SMTP_SERVERUSERNAME',
            'USE_SMTP_SERVERPASS',
            'COMPANY_NAME',
          ],
        })
        .execute();
      const settingObject: any = {};
      for (let i = 0; i < settingsDetail.length; i++) {
        const { name, value } = settingsDetail[i];
        settingObject[name] = value;
      }

      return settingObject;
    } catch (err) {
      console.log('ERROR_SETTINGS_ITEM', err);
      return null;
    }
  }

  createMailerOptions = async () => {
    const settingData = await this.getSettingsItem();
    if (settingData) {
      return {
        transport: {
          host: settingData.USE_SMTP_SERVERHOST,
          secure: settingData.USE_SMTP_SERVERPORT.toString() === '465',
          port: Number(settingData.USE_SMTP_SERVERPORT),
          auth: {
            user: settingData.USE_SMTP_SERVERUSERNAME,
            pass: settingData.USE_SMTP_SERVERPASS,
          },
        },
        defaults: {
          from: `${settingData.COMPANY_NAME} <${settingData.NOTIFICATION_EMAIL}>`,
        },
        template: {
          dir: path.join(__dirname + '/templates'),
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      };
    }
    return null;
  };
}

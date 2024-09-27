import { Module, forwardRef } from '@nestjs/common';
import { Custom } from './custom.utility';
import { ServicesModule } from '@app/services';
import './config';
import { ListUtility } from './list.utility';

@Module({
  imports: [forwardRef(() => ServicesModule)],
  providers: [Custom, ListUtility],
  exports: [Custom, ListUtility],
})
export class UtilitiesModule {}

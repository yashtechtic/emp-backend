import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  LoggerService,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { Custom } from '@app/utilities/custom.utility';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { CompanyService } from './company.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import {
  IApiResponse,
  SUCCESS,
} from '@app/common-config/interfaces/common-interface';
import {
  ICompanyDetail,
  ICompanyRecord,
} from '../../interfaces/companies/company.interface';
import { MESSAGE } from '@app/utilities/message';
import { ACTIONS } from '@app/utilities/action';
import { CommonConfigService } from '@app/common-config/common-config.service';

@Controller('company')
export class CompanyController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private companyService: CompanyService,
    private customUtility: Custom,
    private commonService: CommonConfigService
  ) {}
  private entity = 'company';

  // Company Registration
  @Post('registration')
  async createCompany(
    @Body() body: CreateCompanyDto
  ): Promise<IApiResponse<ICompanyRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        entity: this.entity,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        action: ACTIONS.NOT_ADDED,
        data: {},
      };

      const addCompany = await this.companyService.createCompany(body);
      if (addCompany && addCompany.identifiers.length > 0) {
        result.success = SUCCESS.true;
        result.statusCode = HttpStatus.CREATED;
        result.action = ACTIONS.ADDED;
        result.data = {
          companyId: addCompany.identifiers[0].companyId,
        };
      }

      return this.customUtility.getResponseTemplate({
        success: result.success,
        action: result.action,
        entity: result.entity,
        data: result.data,
        statusCode: result.statusCode,
        message: addCompany.raw.message,
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('company-list')
  async findCompanyList(): Promise<IApiResponse<ICompanyDetail>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };

      const responseCompanyData = [];
      const companySettingList =
        await this.companyService.getCompanySettingList();
      for (const companySetting of companySettingList) {
        // Fetch company data from the current database
        const companyData = await this.commonService.connectToDatabaseViaURL(
          companySetting.connectionUrl,
          'company'
        );
        if (typeof companyData === 'object') {
          let filterCompanyData = JSON.parse(JSON.stringify(companyData));
          filterCompanyData = filterCompanyData.filter(
            (data) => data.iCompanyId === companySetting.companyId
          );
          const response =
            await this.companyService.companyDataFormat(filterCompanyData);

          responseCompanyData.push(response[0]);

          result.success = SUCCESS.true;
          result.statusCode = HttpStatus.OK;
          result.action = ACTIONS.LIST_FOUND;
          result.data = responseCompanyData;
        }
      }
      return this.customUtility.getResponseTemplate({
        success: result.success,
        action: result.action,
        entity: this.entity,
        data: result.data,
        statusCode: result.statusCode,
      });
    } catch (error) {
      console.log('findCompanyList Error->>', error);
      this.logger.error('Error in findCompanyList:', error);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('/:companyId')
  async companyProfile(
    @Param('companyId') companyId: number
  ): Promise<IApiResponse<ICompanyDetail>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.DETAIL_NOT_FOUND,
        data: {},
      };
      let companyDetails =
        await this.companyService.getCompanyDetails(companyId);

      companyDetails = await this.commonService.getImageUrl(
        companyDetails,
        'company_logo'
      );

      companyDetails = {
        ...companyDetails,
        logoUrl: companyDetails.imageUrl,
      };

      if (companyDetails) {
        result.success = SUCCESS.true;
        result.statusCode = HttpStatus.OK;
        result.action = ACTIONS.DETAIL_FOUND;
        result.data = companyDetails;
      }

      return this.customUtility.getResponseTemplate({
        success: result.success,
        action: result.action,
        entity: this.entity,
        data: result.data,
        statusCode: result.statusCode,
      });
    } catch (error) {
      console.log('findCompanyList Error->>', error);
      this.logger.error('Error in findCompanyList:', error);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('profile/:companyId')
  async updateCompany(
    @Param('companyId') companyId: number,
    @Body() body: UpdateCompanyDto
  ): Promise<IApiResponse<ICompanyDetail>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.DETAIL_NOT_FOUND,
        data: {},
      };

      const uploadInfo = await this.commonService.processAndValidateFile(
        body.logo
      );
      if ('name' in uploadInfo) {
        body.logo = uploadInfo.name;
      }

      const companyDetails = await this.companyService.updateCompanyDetails(
        companyId,
        body
      );

      if (companyDetails?.affected) {
        uploadInfo.folderName = 'company_logo/';
        this.commonService.uploadFolderImage(uploadInfo);
        result.success = SUCCESS.true;
        result.statusCode = HttpStatus.OK;
        result.action = ACTIONS.UPDATED;
        result.data = companyDetails;
      }

      return this.customUtility.getResponseTemplate({
        success: result.success,
        action: result.action,
        entity: this.entity,
        data: result.data,
        statusCode: result.statusCode,
      });
    } catch (error) {
      console.log('findCompanyList Error->>', error);
      this.logger.error('Error in findCompanyList:', error);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

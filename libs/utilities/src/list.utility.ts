import { SettingsService } from '@app/services/services/settings.service';
import { Inject, forwardRef } from '@nestjs/common';
import _ from 'underscore';

export class ListUtility {
  constructor(
    @Inject(forwardRef(() => SettingsService))
    private settings: SettingsService
  ) {}

  prepareListingCriteria(inputParams, aliasList, queryObject) {
    let aliasKey;
    let aliasVal;

    if ('filters' in inputParams) {
      if (_.isString(inputParams.filters) && !_.isEmpty(inputParams.filters)) {
        inputParams.filters = JSON.parse(inputParams.filters);
      }

      if (_.isArray(inputParams.filters)) {
        const { filters } = inputParams;
        filters.forEach((data) => {
          aliasKey = data.key;
          aliasVal = data.value;
          if (aliasKey && aliasKey in aliasList) {
            const prop_val = `custom_${aliasKey}`;
            queryObject.andWhere(`${aliasList[aliasKey]} = :${prop_val}`, {
              [prop_val]: aliasVal,
            });
          }
        });
      }
    }

    if ('sort' in inputParams) {
      if (_.isString(inputParams.sort) && !_.isEmpty(inputParams.sort)) {
        inputParams.sort = JSON.parse(inputParams.sort);
      }

      if (_.isArray(inputParams.sort)) {
        const sortList = inputParams.sort;
        sortList.map((sortField) => {
          const upperSortDir = sortField.dir
            ? sortField.dir.toUpperCase()
            : 'ASC';

          if (
            sortField.prop &&
            upperSortDir &&
            aliasList[sortField.prop] &&
            ['ASC', 'DESC'].indexOf(upperSortDir) !== -1
          ) {
            queryObject.addOrderBy(aliasList[sortField.prop], upperSortDir);
          }
        });
      }
    }

    if (
      'keyword' in inputParams &&
      !_.isEmpty(inputParams.keyword) &&
      inputParams.keywordColumns &&
      inputParams.keywordColumns.length > 0
    ) {
      const searchKeyword = inputParams.keyword;
      const orConditions = inputParams.keywordColumns.map((column) => {
        return `${column} LIKE :keyword`;
      });
      const combinedConditions = orConditions.join(' OR ');
      queryObject.andWhere(`(${combinedConditions})`, {
        keyword: `%${searchKeyword}%`,
      });
    }
  }

  getTotalPages(totRecords, recPerPage) {
    if (recPerPage === 0) {
      return 1;
    }
    const totPages = Math.ceil(totRecords / recPerPage);
    return totPages;
  }

  getStartIndex(pageNum, recLimit) {
    pageNum = pageNum > 0 ? pageNum : 1;
    recLimit = recLimit > 0 ? recLimit : 20;
    const startIdx = (pageNum - 1) * recLimit;
    return startIdx;
  }

  getPagination(totRecords, params) {
    let pageIndex = 1;
    if ('page' in params) {
      pageIndex = params.page;
    }
    let offsetIdx = null;
    if ('offset' in params) {
      offsetIdx = params.offset;
    }
    const paging: any = {};
    const recLimit = params.limit > 0 ? Number(params.limit) : 20;
    const currPage = pageIndex > 0 ? Number(pageIndex) : 1;
    const totPages = this.getTotalPages(totRecords, recLimit);
    let startIdx = 0;
    if (Number(offsetIdx)) {
      startIdx = Number(offsetIdx);
    } else {
      startIdx = this.getStartIndex(currPage, recLimit);
    }
    paging.count = totRecords;
    paging.offset = startIdx;
    paging.per_page = recLimit;
    paging.curr_page = currPage;
    paging.prev_page = currPage > 1 ? 1 : 0;
    paging.next_page = currPage + 1 > totPages ? 0 : 1;
    return paging;
  }
}

import { Injectable } from '@nestjs/common';
import {
  format,
  getUnixTime,
  getTime,
  add,
  addMilliseconds,
  sub,
  subMilliseconds,
  isValid,
  parse,
  isMatch,
  compareAsc,
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  fromUnixTime,
  isBefore,
  isAfter,
  endOfDay,
  startOfDay,
} from 'date-fns';

import { SettingsService } from './settings.service';
@Injectable()
export class DateService {
  constructor(private settings: SettingsService) {}
  getCurrentDate = () => format(new Date(), 'yyyy-MM-dd');

  getCurrentTime = () => format(new Date(), 'HH:mm:ss');

  getCurrentDateTime = () => format(new Date(), 'yyyy-MM-dd HH:mm:ss');

  getCurrentTimeStamp = () => getUnixTime(new Date());

  getCurrentTimeMS = () => getTime(new Date());

  getDateTimeAfter = (value, type) => {
    let dateTime;
    if (
      [
        'years',
        'months',
        'weeks',
        'days',
        'hours',
        'minutes',
        'seconds',
      ].includes(type)
    ) {
      const addObj = {};
      addObj[type] = value;
      dateTime = add(new Date(), addObj);
    } else if (type === 'milliseconds') {
      dateTime = addMilliseconds(new Date(), value);
    }
    return format(dateTime, 'yyyy-MM-dd HH:mm:ss');
  };

  getDateTimeBefore = (value, type) => {
    let dateTime;
    if (
      [
        'years',
        'months',
        'weeks',
        'days',
        'hours',
        'minutes',
        'seconds',
      ].includes(type)
    ) {
      const addObj = {};
      addObj[type] = value;
      dateTime = sub(new Date(), addObj);
    } else if (type === 'milliseconds') {
      dateTime = subMilliseconds(new Date(), value);
    }
    return format(dateTime, 'yyyy-MM-dd HH:mm:ss');
  };

  getDateDBFormat = (value) => {
    if (!value) return value;
    if (!isValid(new Date(value))) return value;
    return format(new Date(value), 'yyyy-MM-dd');
  };

  getDateSystemFormat = async (value) => {
    if (!value || value === '0000-00-00') return value;
    if (!isValid(new Date(value))) return value;
    const dstfmt = this.getSystemDateFormat(
      await this.settings.getItem('ADMIN_DATE_FORMAT')
    );
    return format(new Date(value), dstfmt);
  };

  getTimeSystemFormat = async (value) => {
    if (!value || value === '00:00:00') return value;
    if (!isMatch(value, 'HH:mm:ss')) return value;
    const dstfmt = this.getSystemTimeFormat(
      await this.settings.getItem('ADMIN_TIME_FORMAT')
    );
    const parseDate = parse(value, 'HH:mm:ss', new Date());
    return format(parseDate, dstfmt);
  };

  getDateTimeSystemFormat = async (value) => {
    if (!value || value === '0000-00-00 00:00:00') return value;
    if (!isValid(new Date(value))) return value;
    const dstfmt = this.getSystemDateTimeFormat(
      await this.settings.getItem('ADMIN_DATE_TIME_FORMAT')
    );
    return format(new Date(value), dstfmt);
  };

  getDateCustomFormat = (value, dstfmt) => {
    if (!value || value === '0000-00-00') return value;
    if (!isValid(new Date(value))) return value;
    return format(new Date(value), dstfmt);
  };

  getTimeCustomFormat = (value, dstfmt) => {
    if (!value || value === '00:00:00') return value;
    if (!isMatch(value, 'HH:mm:ss')) return value;
    const parseDate = parse(value, 'HH:mm:ss', new Date());
    return format(parseDate, dstfmt);
  };

  getDateTimeCustomFormat = (value, dstfmt) => {
    if (!value || value === '0000-00-00 00:00:00') return value;
    if (!isValid(new Date(value))) return value;
    return format(new Date(value), dstfmt);
  };

  getSystemDateFormat = (sysfmt) => {
    // date formats
    const dateFnsDate = {
      dfmt_1: 'yyyy-MM-dd',
      dfmt_2: 'MM-dd-yyyy',
      dfmt_3: 'dd-MM-yyyy',
      dfmt_4: 'MM/dd/yyyy',
      dfmt_5: 'dd/MM/yyyy',
      dfmt_6: 'yyyy/MM/dd',
      dfmt_7: 'dd.MM.yyyy',
      dfmt_8: 'yyyy.MM.dd',
      dfmt_9: 'MM.dd.yyyy',
      dfmt_10: 'MMM dd, yyyy',
      dfmt_11: 'dd MMM, yyyy',
      dfmt_12: 'dd.MMM.yyyy',
      dfmt_13: 'dd/MMM/yyyy',
      dfmt_14: 'dd-MMM-yyyy',
      dfmt_15: 'MMMM dd, yyyy',
      dfmt_16: 'dd MMMM, yyyy',
      dfmt_17: 'EEE MMM dd, yyyy',
      dfmt_18: 'EEE dd MMM, yyyy',
      dfmt_19: 'EEEE, MMMM dd, yyyy',
      dfmt_20: 'EEEE, dd MMMM, yyyy',
    };

    if (sysfmt === '' || !(sysfmt in dateFnsDate)) {
      sysfmt = 'dfmt_1';
    }
    return dateFnsDate[sysfmt];
  };

  getSystemTimeFormat = (sysfmt) => {
    // time formats
    const dateFnsTime = {
      tfmt_1: 'h:mm a',
      tfmt_2: 'HH:mm:ss',
      tfmt_3: 'HH:mm',
    };

    if (sysfmt === '' || !(sysfmt in dateFnsTime)) {
      sysfmt = 'tfmt_1';
    }
    return dateFnsTime[sysfmt];
  };

  getSystemDateTimeFormat = (sysfmt) => {
    // date time formats
    const dateFnsDateTime = {
      dtfmt_1: 'yyyy-MM-dd HH:mm:ss',
      dtfmt_2: 'yyyy-MM-dd hh:mm a',
      dtfmt_3: 'yyyy-MM-dd HH:mm',
      dtfmt_4: 'MM-dd-yyyy HH:mm:ss',
      dtfmt_5: 'MM-dd-yyyy hh:mm a',
      dtfmt_6: 'MM-dd-yyyy HH:mm',
      dtfmt_7: 'dd-MM-yyyy HH:mm:ss',
      dtfmt_8: 'dd-MM-yyyy hh:mm a',
      dtfmt_9: 'dd-MM-yyyy HH:mm',
      dtfmt_10: 'MM/dd/yyyy HH:mm:ss',
      dtfmt_11: 'MM/dd/yyyy hh:mm a',
      dtfmt_12: 'MM/dd/yyyy HH:mm',
      dtfmt_13: 'dd/MM/yyyy HH:mm:ss',
      dtfmt_14: 'dd/MM/yyyy hh:mm a',
      dtfmt_15: 'dd/MM/yyyy HH:mm',
      dtfmt_16: 'yyyy/MM/dd HH:mm:ss',
      dtfmt_17: 'yyyy/MM/dd hh:mm a',
      dtfmt_18: 'yyyy/MM/dd HH:mm',
      dtfmt_19: 'dd.MM.yyyy HH:mm:ss',
      dtfmt_20: 'dd.MM.yyyy hh:mm a',
      dtfmt_21: 'dd.MM.yyyy HH:mm',
      dtfmt_22: 'yyyy.MM.dd HH:mm:ss',
      dtfmt_23: 'yyyy.MM.dd hh:mm a',
      dtfmt_24: 'yyyy.MM.dd HH:mm',
      dtfmt_25: 'MM.dd.yyyy HH:mm:ss',
      dtfmt_26: 'MM.dd.yyyy hh:mm a',
      dtfmt_27: 'MM.dd.yyyy HH:mm',
      dtfmt_28: 'MMM dd, yyyy HH:mm:ss',
      dtfmt_29: 'MMM dd, yyyy hh:mm a',
      dtfmt_30: 'MMM dd, yyyy HH:mm',
      dtfmt_31: 'dd MMM, yyyy HH:mm:ss',
      dtfmt_32: 'dd MMM, yyyy hh:mm a',
      dtfmt_33: 'dd MMM, yyyy HH:mm',
      dtfmt_34: 'dd.MMM.yyyy HH:mm:ss',
      dtfmt_35: 'dd.MMM.yyyy hh:mm a',
      dtfmt_36: 'dd.MMM.yyyy HH:mm',
      dtfmt_37: 'dd/MMM/yyyy HH:mm:ss',
      dtfmt_38: 'dd/MMM/yyyy hh:mm a',
      dtfmt_39: 'dd/MMM/yyyy HH:mm',
      dtfmt_40: 'dd-MMM-yyyy HH:mm:ss',
      dtfmt_41: 'dd-MMM-yyyy hh:mm a',
      dtfmt_42: 'dd-MMM-yyyy HH:mm',
      dtfmt_43: 'MMMM dd, yyyy HH:mm:ss',
      dtfmt_44: 'MMMM dd, yyyy hh:mm a',
      dtfmt_45: 'MMMM dd, yyyy HH:mm',
      dtfmt_46: 'dd MMMM, yyyy HH:mm:ss',
      dtfmt_47: 'dd MMMM, yyyy hh:mm a',
      dtfmt_48: 'dd MMMM, yyyy HH:mm',
      dtfmt_49: 'EEE MMM dd, yyyy HH:mm:ss',
      dtfmt_50: 'EEE MMM dd, yyyy hh:mm a',
      dtfmt_51: 'EEE MMM dd, yyyy HH:mm',
      dtfmt_52: 'EEE dd MMM, yyyy HH:mm:ss',
      dtfmt_53: 'EEE dd MMM, yyyy hh:mm a',
      dtfmt_54: 'EEE dd MMM, yyyy HH:mm',
      dtfmt_55: 'EEEE, MMMM dd, yyyy HH:mm:ss',
      dtfmt_56: 'EEEE, MMMM dd, yyyy hh:mm a',
      dtfmt_57: 'EEEE, MMMM dd, yyyy HH:mm',
      dtfmt_58: 'EEEE, dd MMMM, yyyy HH:mm:ss',
      dtfmt_59: 'EEEE, dd MMMM, yyyy hh:mm a',
      dtfmt_60: 'EEEE, dd MMMM, yyyy HH:mm',
    };

    if (sysfmt === '' || !(sysfmt in dateFnsDateTime)) {
      sysfmt = 'dtfmt_1';
    }
    return dateFnsDateTime[sysfmt];
  };

  isValidDate = (value) => {
    if (!isValid(new Date(value))) {
      return false;
    }
    return true;
  };

  isValidTime = (value) => {
    if (!isMatch(value, 'HH:mm:ss')) {
      return false;
    }
    return true;
  };

  getSystemFormatLabels = (sysfmt, type) => {
    const formats = [
      'ADMIN_DATE_FORMAT',
      'ADMIN_DATE_TIME_FORMAT',
      'ADMIN_TIME_FORMAT',
    ];

    if (type === '' || !formats.includes(type)) {
      type = 'ADMIN_DATE_FORMAT';
    }
    let formatLabels;

    if (type === 'ADMIN_DATE_FORMAT') {
      formatLabels = {
        dfmt_1: '2011-11-30',
        dfmt_2: '04-30-2016',
        dfmt_3: '30-04-2016',
        dfmt_4: '11/30/2011',
        dfmt_5: '30/11/2011',
        dfmt_6: '2016/04/30',
        dfmt_7: '30.08.2011',
        dfmt_8: '2016.04.30',
        dfmt_9: '04.30.2016',
        dfmt_10: 'Nov 30, 2011',
        dfmt_11: '30 Apr, 2016',
        dfmt_12: '30.Apr.2016',
        dfmt_13: '30/Apr/2016',
        dfmt_14: '30-Apr-2016',
        dfmt_15: 'November 30, 2011',
        dfmt_16: '30 April, 2016',
        dfmt_17: 'Wed Nov 30, 2011',
        dfmt_18: 'Sat 30 Apr, 2016',
        dfmt_19: 'Wednesday, November 30, 2011',
        dfmt_20: 'Saturday, 30 April, 2016',
      };
    } else if (type === 'ADMIN_DATE_TIME_FORMAT') {
      formatLabels = {
        dtfmt_1: '2011-11-30 20:00:00',
        dtfmt_2: '2011-11-30 8:00 PM',
        dtfmt_3: '2011-11-30 20:00',
        dtfmt_4: '04-30-2016 19:40:00',
        dtfmt_5: '04-30-2016 5:44 PM',
        dtfmt_6: '04-30-2016 18:42',
        dtfmt_7: '30-04-2016 16:43:00',
        dtfmt_8: '30-04-2016 1:51 PM',
        dtfmt_9: '24-04-2016 16:31',
        dtfmt_10: '04/30/2016 14:53:00',
        dtfmt_11: '11/30/2011 8:00 PM',
        dtfmt_12: '04/24/2016 19:38',
        dtfmt_13: '30/04/2016 19:40:00',
        dtfmt_14: '30/11/2011 8:00 PM',
        dtfmt_15: '30/04/2016 19:41',
        dtfmt_16: '2016/04/30 21:34:00',
        dtfmt_17: '2016/04/29 6:41 PM',
        dtfmt_18: '2016/04/24 20:48',
        dtfmt_19: '29.04.2016 16:51:00',
        dtfmt_20: '27.04.2016 7:37 PM',
        dtfmt_21: '30.08.2011 20:00',
        dtfmt_22: '2016.04.22 16:29:00',
        dtfmt_23: '2016.04.25 8:46 PM',
        dtfmt_24: '2016.04.28 21:32',
        dtfmt_25: '04.23.2016 20:47:00',
        dtfmt_26: '04.19.2016 7:46 PM',
        dtfmt_27: '04.17.2016 21:40',
        dtfmt_28: 'Apr 22, 2016 19:41:00',
        dtfmt_29: 'Apr 30, 2016 8:31 PM',
        dtfmt_30: 'Apr 16, 2016 15:29',
        dtfmt_31: '12 Apr, 2016 16:44:00',
        dtfmt_32: '18 Apr, 2016 8:34 PM',
        dtfmt_33: '23 Apr, 2016 16:34',
        dtfmt_34: '25.Apr.2016 18:33:00',
        dtfmt_35: '20.Apr.2016 8:30 PM',
        dtfmt_36: '29.Apr.2016 18:33',
        dtfmt_37: '24/Apr/2016 20:44:00',
        dtfmt_38: '23/Apr/2016 10:34 PM',
        dtfmt_39: '25/Apr/2016 17:43',
        dtfmt_40: '28-Apr-2016 18:31:00',
        dtfmt_41: '23-Apr-2016 6:35 PM',
        dtfmt_42: '30-Apr-2016 18:40',
        dtfmt_43: 'April 30, 2016 08:43:00',
        dtfmt_44: 'April 23, 2016 10:45 AM',
        dtfmt_45: 'April 16, 2016 02:21',
        dtfmt_46: '23 April, 2016 05:36:00',
        dtfmt_47: '23 April, 2016 8:37 AM',
        dtfmt_48: '30 April, 2016 15:44',
        dtfmt_49: 'Fri Apr 29, 2016 17:22:00',
        dtfmt_50: 'Sat Apr 30, 2016 6:32 PM',
        dtfmt_51: 'Sat Apr 30, 2016 10:46',
        dtfmt_52: 'Tue 26 Apr, 2016 18:27:00',
        dtfmt_53: 'Sat 30 Apr, 2016 12:29 PM',
        dtfmt_54: 'Sat 30 Apr, 2016 14:25',
        dtfmt_55: 'Saturday, April 30, 2016 11:28:00',
        dtfmt_56: 'Saturday, April 30, 2016 11:46 AM',
        dtfmt_57: 'Saturday, April 30, 2016 09:42',
        dtfmt_58: 'Saturday, 30 April, 2016 17:29:00',
        dtfmt_59: 'Saturday, 30 April, 2016 4:29 PM',
        dtfmt_60: 'Saturday, 30 April, 2016 12:30',
      };
    } else if (type === 'ADMIN_TIME_FORMAT') {
      formatLabels = {
        tfmt_1: '8:00 AM',
        tfmt_2: '16:00:00',
        tfmt_3: '16:00',
      };
    }

    if (sysfmt === '' || !(sysfmt in formatLabels)) {
      sysfmt = 'dfmt_1';
    }

    return formatLabels[sysfmt];
  };

  // Compare the two dates and return 1 if the first date is after the second,
  // -1 if the first date is before the second or 0 if dates are equal.
  compare = (dateLeft, dateRight) =>
    compareAsc(
      dateLeft && dateLeft > 0 ? new Date(dateLeft) : new Date(),
      dateRight && dateRight > 0 ? new Date(dateRight) : new Date()
    );

  diff = (dateLeft, dateRight, type) => {
    let res = 0;
    dateLeft = new Date(dateLeft);
    dateRight = new Date(dateRight);

    switch (type) {
      case 'seconds':
        res = differenceInSeconds(dateLeft, dateRight);
        break;
      case 'minutes':
        res = differenceInMinutes(dateLeft, dateRight);
        break;
      case 'hours':
        res = differenceInHours(dateLeft, dateRight);
        break;
      case 'days':
        res = differenceInDays(dateLeft, dateRight);
        break;
      case 'months':
        res = differenceInMonths(dateLeft, dateRight);
        break;
      case 'years':
      default:
        res = differenceInYears(dateLeft, dateRight);
        break;
    }
    return res;
  };

  validateDates(startDateMs, endDateMs) {
    // Convert milliseconds to Date objects
    const startDate = fromUnixTime(startDateMs / 1000);
    const endDate = fromUnixTime(endDateMs / 1000);
    const now = new Date();

    // Normalize dates to ignore time components
    const startOfStartDate = startOfDay(startDate);
    const startOfEndDate = startOfDay(endDate);
    const startOfToday = startOfDay(now);
    const endOfToday = endOfDay(startOfToday);

    // Log dates for debugging
    console.log('Start Date:', startOfStartDate.toISOString());
    console.log('End Date:', startOfEndDate.toISOString());
    console.log('Current Date:', now.toISOString());
    console.log('Start of Today:', startOfToday.toISOString());
    console.log('End of Today:', endOfToday.toISOString());

    // Check if both dates are valid
    if (!isValid(startOfStartDate) || !isValid(startOfEndDate)) {
      return { valid: false, message: 'Invalid date' };
    }

    // Check if startDate is before endDate
    if (!isBefore(startOfStartDate, startOfEndDate)) {
      return {
        valid: false,
        message: 'Start date should be less than end date',
      };
    }

    // Check if endDate is after startDate
    if (!isAfter(startOfEndDate, startOfStartDate)) {
      return {
        valid: false,
        message: 'End date should be greater than start date',
      };
    }

    // Check if both dates are not in the future
    if (
      isAfter(startOfStartDate, endOfToday) ||
      isAfter(startOfEndDate, endOfToday)
    ) {
      return { valid: false, message: 'Date should not be in the future' };
    }

    // If all checks pass
    return { valid: true, message: 'Dates are valid' };
  }
}

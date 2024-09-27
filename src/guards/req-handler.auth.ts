import { ACTIONS } from '@app/utilities/action';
import { MESSAGE } from '@app/utilities/message';
import { HttpStatus, UnauthorizedException } from '@nestjs/common';

export function handleReq(err, user, info) {
  let response = {};
  if (err) {
    throw err || new UnauthorizedException();
  } else if (typeof info != 'undefined' || !user) {
    info.message = info.message.toUpperCase().replace(/\s+/g, '_');
    switch (info.message) {
      case ACTIONS.NO_AUTH_TOKEN:
        response = {
          code: HttpStatus.NOT_FOUND,
          message: MESSAGE[ACTIONS.NO_AUTH_TOKEN](),
        };
        break;
      case ACTIONS.INVALID_SIGNATURE:
        response = {
          code: HttpStatus.NOT_FOUND,
          message: MESSAGE[ACTIONS.INVALID_SIGNATURE](),
        };
        break;
      case ACTIONS.JWT_MALFORMED:
        response = {
          code: HttpStatus.NOT_FOUND,
          message: MESSAGE[ACTIONS.JWT_MALFORMED](),
        };
        break;
      case ACTIONS.INVALID_TOKEN:
        response = {
          code: HttpStatus.NOT_FOUND,
          message: MESSAGE[ACTIONS.INVALID_TOKEN](),
        };
        break;
      case ACTIONS.JWT_EXPIRED:
        response = {
          code: HttpStatus.BAD_REQUEST,
          message: MESSAGE[ACTIONS.JWT_EXPIRED](),
        };
        break;
    }
    throw err || new UnauthorizedException(response);
  }
  return user;
}

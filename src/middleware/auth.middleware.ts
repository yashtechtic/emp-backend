// auth-strategy.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import routes from '../config/routes';

@Injectable()
export class AuthStrategyMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const path = req.url;
    const isNoAuthRoute = routes.public.some((publicPath) =>
      path.includes(publicPath)
    );
    if (isNoAuthRoute) {
      req.authStrategy = 'public';
      return next();
    }

    const isAdminPath = routes.admin.some((adminPath) =>
      path.includes(adminPath)
    );

    if (isAdminPath) {
      req.authStrategy = 'jwt';
      console.log('req.authStrategy', req.authStrategy);
    } else if (req.headers['auth_key']) {
      req.authStrategy = 'headerKey';
    }
    next();
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['tenantid'] || 'employee_training'; // Example: Extract tenant ID from a custom header
    if (!tenantId) {
      return res.status(400).send('Tenant ID is required');
    }
    (req as any).tenantId = tenantId; // Attach tenant ID to the request object
    console.log('Tenant ID:', tenantId)
    next();
  }
}

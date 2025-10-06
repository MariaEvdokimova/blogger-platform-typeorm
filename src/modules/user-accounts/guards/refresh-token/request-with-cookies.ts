import { Request } from 'express';
import { SecurityDeviceContextDto } from '../../dto/security-device-context.dto';

export interface RequestWithCookies extends Request {
  cookies: Record<string, string>;
  securityContext?: SecurityDeviceContextDto;
}

import { Controller, Post, Body } from '@nestjs/common';
import { IdentifyService } from './identify.service';

@Controller('identify')
export class IdentifyController {
  constructor(private identifyService: IdentifyService) {}

  @Post()
  identify(@Body() body: { email?: string; phoneNumber?: string }) {
    return this.identifyService.identifyContact(body.email, body.phoneNumber);
  }
}

import { Controller, Get, Inject } from '@nestjs/common';

import { AppService } from './app.service.js';

@Controller()
export class AppController {
  private readonly appService: AppService;

  constructor(@Inject(AppService) appService: AppService) {
    this.appService = appService;
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

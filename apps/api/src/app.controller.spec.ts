import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  test('returns the starter response', () => {
    expect(appController.getHello()).toBe('Hello World!');
  });
});

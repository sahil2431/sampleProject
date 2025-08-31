import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  it('delegates to service', async () => {
    const mock = { getHello: jest.fn(() => 'ok') };
    const mod = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mock }],
    }).compile();

    const ctrl = mod.get(AppController);
    // if your controller method differs, adjust:
    const val = (ctrl as any).getHello?.();
    if (val !== undefined) expect(val).toBe('ok');
    expect(mock.getHello).toHaveBeenCalled();
  });
});

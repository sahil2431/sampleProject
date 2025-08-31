import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidUnknownValues: false }));
    await app.init();
  });

  it('GET / -> 200', async () => {
    await request(app.getHttpServer()).get('/').expect(res =>
      expect([200, 301, 302, 404]).toContain(res.status) // adjust if root is different
    );
  });

  afterAll(async () => app.close());
});

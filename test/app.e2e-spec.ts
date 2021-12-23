import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    jest.setTimeout(60000);
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
  it('/iterable-shopify-profile (POST)', () => {
    const data = {
      userId: '5125198053564',
      accepts_marketing: true,
      email: 'llambert@liveowyn.com',
    };
    return request(app.getHttpServer())
      .post(`/iterable-shopify-profile?userId=${data.userId}`)
      .send(data)
      .expect(200);
  });
});

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUserService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  const userTemplate = {
    id: 1,
    email: '<email>',
    password: '<password>',
  } as User;
  const userWith = (attrs: Partial<User> = {}): User => {
    return { ...userTemplate, ...attrs } as User;
  };

  beforeEach(async () => {
    fakeUserService = {
      findOne(id: number) {
        return Promise.resolve(userWith({ id }));
      },
      find(email: string) {
        return Promise.resolve([userWith({ email })]);
      },
      update(id: number, attrs: Partial<User>) {
        return Promise.resolve(userWith({ ...attrs, id }));
      },
      remove(id: number) {
        return Promise.resolve(userWith({ id }));
      },
    };
    fakeAuthService = {
      signup(email: string, password: string) {
        return Promise.resolve(userWith({ email, password }));
      },
      signin(email: string, password: string) {
        return Promise.resolve(userWith({ email, password }));
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
        { provide: AuthService, useValue: fakeAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findUser', () => {
    it('should find user', async () => {
      // given
      const anyIdAsString = '1';

      // when
      const result = await controller.findUser(anyIdAsString);

      // then
      expect(result.id).toStrictEqual(parseInt(anyIdAsString));
    });

    it('should not find user by unknown id', async () => {
      // given
      const unknownId = '1_000';
      fakeUserService.findOne = (id: number) => null;

      // when, then
      await expect(controller.findUser(unknownId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('signin', () => {
    it('should signin user', async () => {
      // given
      const body = { email: '<email>', password: '<password>' };
      const session = { userId: undefined };

      // when
      const result = await controller.signIn(body, session);

      // then
      expect(result.email).toStrictEqual(body.email);
      expect(result.password).toStrictEqual(body.password);
      expect(result.id).toBeDefined();
      expect(session.userId).toStrictEqual(result.id);
    });
  });
});

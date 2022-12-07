import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUserService: Partial<UsersService>;

  beforeEach(async () => {
    // create a fake copy of the users service
    fakeUserService = {
      find: (email: string) => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    // given
    const email = '<email>';
    const password = '<password>';

    // when
    const result = await service.signup(email, password);

    // then
    const saltedAndHashedPassword = result.password;
    const [salt, hash] = saltedAndHashedPassword.split('.');
    expect(saltedAndHashedPassword).not.toStrictEqual(password);
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
    // and
    expect(result.email).toStrictEqual(email);
  });

  it('throws an error if user signs up with email that is in use', async () => {
    // given
    const email = '<email>';
    const password = '<password>';
    fakeUserService.find = (email: string) => {
      return Promise.resolve([{ id: 1, email, password } as User]);
    };

    // when, then
    await expect(service.signup(email, password)).rejects.toThrow(
      BadRequestException,
    );
  });
});

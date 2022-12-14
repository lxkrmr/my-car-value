import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUserService: Partial<UsersService>;

  beforeEach(async () => {
    // create a fake copy of the users service
    const users: User[] = [];
    fakeUserService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = { id: users.length, email, password } as User;
        users.push(user);
        return Promise.resolve(user);
      },
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

  it('user can not sign up with known email', async () => {
    // given
    const email = '<email>';
    const password = '<password>';
    await service.signup(email, password);

    // when, then
    await expect(service.signup(email, password)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('user can not sigin with unknown email', async () => {
    // given
    const unknownEmail = '<unknown-email>';
    const password = '<password>';

    // when, then
    await expect(service.signin(unknownEmail, password)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('user can not signin with wrong password', async () => {
    // given
    const email = '<email>';
    const password = '<password>';
    const wrongPassword = '<wrong-password>';
    await service.signup(email, password);

    // when, then
    await expect(service.signin(email, wrongPassword)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('user can sigin', async () => {
    // given
    const email = '<email>';
    const password = '<password>';
    const user = await service.signup(email, password);

    // when
    const result = await service.signin(email, password);

    // then
    expect(result).toStrictEqual(user);
  });
});

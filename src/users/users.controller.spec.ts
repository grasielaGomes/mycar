import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findById: (id: number) =>
        Promise.resolve({
          id,
          email: 'test@test.com',
          password: 'test',
        } as User),
      findByEmail: (email: string) =>
        Promise.resolve([
          {
            id: 1,
            email,
            password: 'test',
          } as User,
        ]),
      remove: (id: number) => Promise.resolve({ id } as User),
    };
    fakeAuthService = {
      signin: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: fakeUsersService },
        { provide: AuthService, useValue: fakeAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findByEmail returns a list of users with the given email', async () => {
    const users = await controller.findUserByEmail('asdf@asdf.com');
    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual('asdf@asdf.com');
  });

  it('findById returns a single user with the given id', async () => {
    const user = await controller.findUserById('1');
    expect(user).toBeDefined();
    expect(user.id).toEqual(1);
  });

  it('findById throws an error if user with given id is not found', async () => {
    fakeUsersService.findById = () => null;
    await expect(controller.findUserById('2567')).rejects.toThrow(
      'User not found',
    );
  });

  it('removeUser returns a single user with the given id', async () => {
    const user = await controller.removeUser('1');
    expect(user).toBeDefined();
    expect(user.id).toEqual(1);
  });

  it('signin updates session object and returns user', async () => {
    const session = { userId: -10 };
    const user = await controller.signin(
      { email: 'asdf@asdf.com', password: 'asdf' },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});

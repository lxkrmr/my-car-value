import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(email: string, password: string) {
    // the 'create' method creates a UserEntity and ensures that this entity is valid (based on optional validation annotations)
    // hooks like @AfterInsert etc. will only be triggered if we ensure the usage of an UserEntity.
    const user = this.repo.create({
      email,
      password,
    });

    return this.repo.save(user);
  }

  findOne(id: number) {
    if (!id) {
      return null;
    }
    return this.repo.findOneBy({ id });
  }

  find(email: string) {
    return this.repo.findBy({ email });
  }

  async update(id: number, attrs: Partial<User>) {
    // for the *.save() method we have to fetch the UserEntity from the DB
    // pro: the *.save method is triggering the hooks of UserEntity
    // con: two DB requests are needed for updating a customer
    // alternative: the *.update() method can be called 'directly', but won't trigger the hooks.
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }

    // TODO: do we really want to mutate the existing object?
    Object.assign(user, attrs);

    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }

    return this.repo.remove(user);
  }
}

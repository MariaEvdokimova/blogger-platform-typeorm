import { Injectable } from "@nestjs/common";
import { DomainException } from "@src/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@src/core/exceptions/domain-exception-codes";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../domain/entities/user.entity";
import { IsNull, Repository } from "typeorm";

@Injectable()
export class UsersRepository {

  constructor(
    @InjectRepository( User )
    private user: Repository<User>,
  ) {}

  async save(user: User): Promise<User> {
    return await this.user.save( user );
  }

  async softDelete(id: number): Promise<void> {
    await this.user.softDelete( id );
    return ;
  }

  async findById(id: number): Promise<User | null> {
    return this.user.findOneBy({ id }); //не включает soft-deleted записи, если не указать withDeleted: true
  }

  async findOrNotFoundFail(id: number): Promise<User> {
    const result = await this.findById(id);

    if ( !result ) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'not fouund',
      }); 
    }

    return result;
  }

  async doesExistByLoginOrEmail(
    login: string,
    email: string
  ): Promise<User | null> {
    return this.user.findOne({
      where: [
        { login, deletedAt: IsNull() },
        { email, deletedAt: IsNull() }
      ]
    })
  }

  async findByEmail( email: string ): Promise<User | null> {
    return this.user.findOneBy({ email })
  }

  async updatePasswordHash( passwordHash: string, id: number ): Promise<void> {
    await this.user.update(
      { id },
      { passwordHash }
    );
    return;
  }
}

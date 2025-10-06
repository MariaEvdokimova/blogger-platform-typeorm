import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { add } from "date-fns/add";
import { EmailConfirmation } from "../domain/entities/email-confirmation.entity";
import { IsNull, Repository } from "typeorm";

@Injectable()
export class EmailConfirmationRepository {

  constructor(
    @InjectRepository( EmailConfirmation )
    private emailConfirmation: Repository<EmailConfirmation>,
  ) {}

   async save(dto: EmailConfirmation): Promise<EmailConfirmation> {
    return await this.emailConfirmation.save( dto );
  }

  async findbyUserId( userId: number ): Promise<EmailConfirmation | null> {
    return this.emailConfirmation.findOneBy({ userId });
  }

  async findUserByConfirmationCode ( code: string ): Promise<EmailConfirmation | null> {
    return this.emailConfirmation.findOne({
      where: { 
        confirmationCode: code,
        user: {
          deletedAt: IsNull()
        }
       },
      relations: ['user']
    });
  }

  async updateEmailConfirmationCode( code: string, userId: number ): Promise<void> {
    const emailConfirmation = await this.findbyUserId( userId );
    if ( emailConfirmation ) {
      emailConfirmation.expirationDate = add(new Date(), { hours: 1 });
      emailConfirmation.confirmationCode = code;
      await this.save( emailConfirmation );
      return;
    }
    throw new Error('Failed to update: no previos data in database');
  }
}

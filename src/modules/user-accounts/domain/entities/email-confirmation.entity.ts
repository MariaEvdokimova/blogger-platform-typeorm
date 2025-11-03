import { BaseEntity } from "../../../../core/db/entities/base.entity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: 'emailConfirmation'})
export class EmailConfirmation extends BaseEntity {
  @Column( 'boolean', { default: false })
  public isEmailConfirmed: boolean = false;

  @Column( 'timestamp', { default: null } )
  public expirationDate: Date | null;

  @Column( 'varchar', { default: null})
  public confirmationCode: string | null;

  @OneToOne( () => User, ( user ) => user.emailConfirmation )
  @JoinColumn()
  user: User;

  @Column()
  userId: number;
}

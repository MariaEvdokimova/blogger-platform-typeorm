import { BaseEntity } from "src/core/entities/base.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: 'securityDevice' })
export class SecurityDevice extends BaseEntity {
  @Column('varchar')
  public deviceName: string;

  @Column('uuid')
  public deviceId: string;

  @Column('varchar')
  public ip: string;

  @Column('timestamp', { default: null })
  public iat: Date | null;

  @Column('timestamp', { default: null })
  public exp: Date | null;
  
  @ManyToOne( () => User, ( user ) => user.securityDevices)
  user: User;

  @Column()
  public userId: number;
}

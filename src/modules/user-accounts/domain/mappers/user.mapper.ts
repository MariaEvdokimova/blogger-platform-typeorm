import { User } from "../entities/user.entity";

export class UserMapper {
  static fromDb(row: any): User {
    const user = new User();
    user.login = row.login;
    user.email = row.email; 
    user.passwordHash = row.passwordHash;
    user.id = row.id.toString();
    user.createdAt = row.createdAt;
    user.updatedAt = row.updatedAt;
    user.deletedAt = row.deletedAt;

    return user;
  }
}

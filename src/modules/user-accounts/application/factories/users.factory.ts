import { Injectable } from "@nestjs/common";
import { CryptoService } from "../services/crypto.service";
import { CreateUserDto } from "../../dto/create-user.dto";
import { User } from "../../domain/entities/user.entity";

@Injectable()
export class UsersFactory {
  // ❌ passwordHash: string; ни в коем случае не шарим состояние между методов через св-ва объекта (сервиса, юзкейса, квери, репозитория)
  // потому что синглтон, между разными запросами может быть перезапись данных

  constructor(
    private readonly cryptoService: CryptoService,
  ) {}
  async create(dto: CreateUserDto): Promise<User> {
    const passwordHash = await this.createPasswordHash(dto);
    const user = this.createUserInstance(dto, passwordHash);

    return user;
  }

  private async createPasswordHash(dto: CreateUserDto) {
    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.password,
    );
    return passwordHash;
  }

  private createUserInstance(dto: CreateUserDto, passwordHash: string): User {
    const user = new User();
      user.email = dto.email;
      user.login = dto.login;
      user.passwordHash = passwordHash;
    return user;
  }
}

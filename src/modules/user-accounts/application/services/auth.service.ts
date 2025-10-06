import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../../infrastructure/users.repository";
import { CryptoService } from "./crypto.service";
import { UserContextDto } from "../../dto/user-context.dto";
// import { JwtService } from "@nestjs/jwt";
// import { PasswordRecoveryInputDto } from "../api/input-dto/password-recovery.input-dto";
// import { NewPasswordInputDto } from "../api/input-dto/new-password.input-dto";
// import { DomainException } from "../../../core/exceptions/domain-exceptions";
// import { DomainExceptionCode } from "../../../core/exceptions/domain-exception-codes";

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    ///private jwtService: JwtService,
    private cryptoService: CryptoService,
  ) {}
  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.doesExistByLoginOrEmail(loginOrEmail, loginOrEmail);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.cryptoService.comparePasswords({
      password,
      hash: user.passwordHash || '',
    });

    if (!isPasswordValid) {
      return null;
    }

    return { id: user.id!.toString() };
  }
/*
  async login(userId: string) {
    const accessToken = this.jwtService.sign({ id: userId } as UserContextDto);

    return {
      accessToken,
    };
  }

  async passwordRecovery ( dto: PasswordRecoveryInputDto ): Promise<void> {
   await this.usersRepository.findByEmail( dto.email );
  }

  async newPassword ( dto: NewPasswordInputDto ): Promise<void> {
    const { newPassword, recoveryCode } = dto;
    
    const user = await this.usersRepository.findUserByConfirmationCode( recoveryCode );
    if ( !user 
      || (user.expirationDate && user.expirationDate < new Date())
    ){
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Code incorrect',
      });      
      //throw new ValidationError( `Code incorrect`, 'recoveryCode' );
    }

    const passwordHash = await this.cryptoService.createPasswordHash( newPassword );

    user.updatePasswordHash( passwordHash );
    await this.usersRepository.save( user );
  }  
  */
}

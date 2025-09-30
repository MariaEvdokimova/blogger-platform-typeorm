import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { DomainException } from '../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../exceptions/domain-exception-codes';
import { validate as isUuid } from 'uuid';

/**
 * Not add it globally. Use only locally
 */
@Injectable()
export class ObjectUUIdValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    // Проверяем, что тип данных в декораторе — UUID иначе ошибка not found; status 404

    if (!isUuid(value)) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Invalid ObjectId: ${value}`,
      });
    }

    // Если тип не UUID, возвращаем значение без изменений
    return value;
  }
}
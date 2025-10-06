export class RequestMetadataDto {
  constructor(
    public ip: string,
    public userAgent: string,
    public refreshToken?: string,
  ) {}
}

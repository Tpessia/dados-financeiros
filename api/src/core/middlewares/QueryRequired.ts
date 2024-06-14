import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class QueryRequiredPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value == null) throw new BadRequestException(`Missing required query param: "${metadata.data}"`);
    return value;
  }
}

// export const QueryRequired =
//   (property: string, ...pipes: (Type<PipeTransform> | PipeTransform)[]) =>
//   createParamDecorator(Query)(property, QueryRequiredPipe, ...pipes);
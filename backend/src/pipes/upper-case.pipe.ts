import { Injectable, PipeTransform } from "@nestjs/common"

@Injectable()
export class UpperCasePipe implements PipeTransform {
    transform(value: string): string {
        return value.toUpperCase()
    }
}

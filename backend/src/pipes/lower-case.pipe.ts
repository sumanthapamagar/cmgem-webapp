import { Injectable, PipeTransform } from "@nestjs/common"

@Injectable()
export class LowerCasePipe implements PipeTransform {
    transform(value: string): string {
        return value.toLowerCase()
    }
}

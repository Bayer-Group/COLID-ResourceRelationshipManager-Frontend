import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({ name: 'urlsafe' })
export class UrlSafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {

  }
  transform(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

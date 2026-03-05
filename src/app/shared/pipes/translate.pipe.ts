import { inject, Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

@Pipe({
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private langService = inject(LanguageService);

  transform(key: string) {
    return this.langService.translate(key);
  }
}

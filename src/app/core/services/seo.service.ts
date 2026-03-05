import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  updateTitle(title: string) {
    this.titleService.setTitle(`${title} | ECommerce`);
    this.metaService.updateTag({ property: 'og:title', content: title });
  }

  updateDescription(desc: string) {
    this.metaService.updateTag({ name: 'description', content: desc });
    this.metaService.updateTag({ property: 'og:description', content: desc });
  }

  updateOgImage(imageUrl: string) {
    this.metaService.updateTag({ property: 'og:image', content: imageUrl });
  }
}

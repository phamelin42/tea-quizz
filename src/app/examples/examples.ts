import { Component, input, ViewEncapsulation } from '@angular/core';
import { amazonUrl, type Product } from '../tea/products';

@Component({
  selector: 'app-examples',
  templateUrl: './examples.html',
  styleUrl: './examples.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'app-examples' },
})
export class Examples {
  readonly products = input.required<readonly Product[]>();

  /** Le seul endroit qui fabrique un lien : le tag d’affiliation ne se recopie nulle part. */
  protected url(product: Product): string {
    return amazonUrl(product.asin);
  }
}

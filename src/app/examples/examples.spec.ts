import { TestBed } from '@angular/core/testing';
import { amazonUrl, type Example } from '../tea/products';
import { FIXTURE_CATALOGUE, FIXTURE_GEAR_CATALOGUE } from '../tea/products.fixture';
import { Examples } from './examples';

const PRODUCTS: readonly Example[] = [
  { ...FIXTURE_CATALOGUE.find((item) => item.tea === 'fruit')!, name: 'Mélange rouge' },
  { ...FIXTURE_CATALOGUE.find((item) => item.tea === 'green')!, name: 'Sencha doux' },
];

async function render(products: readonly Example[] = PRODUCTS) {
  const fixture = TestBed.createComponent(Examples);
  fixture.componentRef.setInput('products', products);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('Examples', () => {
  it('pose un lien par produit vers Amazon, dans un nouvel onglet, marqué comme sponsorisé', async () => {
    const element = await render();
    const links = [...element.querySelectorAll('a')];
    expect(links).toHaveLength(PRODUCTS.length);
    links.forEach((link, index) => {
      expect(link.getAttribute('href')).toBe(amazonUrl(PRODUCTS[index].asin));
      expect(link.getAttribute('target')).toBe('_blank');
      const rel = link.getAttribute('rel')!.split(' ');
      expect(rel).toEqual(expect.arrayContaining(['sponsored', 'noopener', 'noreferrer']));
    });
  });

  it('annonce l’ouverture d’un nouvel onglet aux lecteurs d’écran', async () => {
    const element = await render();
    for (const link of element.querySelectorAll('a')) {
      expect(link.querySelector('.fd-sr')?.textContent?.trim()).toBe('(nouvel onglet)');
    }
  });

  it('affiche le nom, la marque et la composition complète de chaque produit', async () => {
    const element = await render([
      {
        ...FIXTURE_CATALOGUE.find((item) => item.tea === 'fruit')!,
        name: 'Mélange rouge',
        ingredients: ['Hibiscus', 'Pomme', 'Églantier'],
      },
    ]);
    const text = element.textContent!.replace(/[ \t\n]+/g, ' ');
    expect(text).toContain('Mélange rouge');
    expect(text).toContain('Maison Exemple');
    expect(text).toContain('Composition : Hibiscus, Pomme, Églantier');
  });

  it('affiche les caractéristiques d’un accessoire, sans composition', async () => {
    const infuser = FIXTURE_GEAR_CATALOGUE.find((item) => item.gear === 'infuser')!;
    const element = await render([infuser]);
    const text = element.textContent!.replace(/[ \t\n]+/g, ' ');
    expect(text).toContain(infuser.name);
    expect(text).toContain(infuser.brand);
    expect(text).toContain('Caractéristiques : Acier inoxydable, Panier de 8 cm');
    expect(text).not.toContain('Composition');
    expect(element.querySelector('a')?.getAttribute('href')).toBe(amazonUrl(infuser.asin));
  });

  it('ne montre ni image, ni prix, ni note', async () => {
    const element = await render();
    expect(element.querySelector('img, svg, picture')).toBeNull();
    expect(element.textContent).not.toMatch(/€|EUR|prix|étoile|★/i);
  });
});

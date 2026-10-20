import type { TeaKey } from './content';
import type { Product } from './products';

/** Pour chaque clé : [ASIN de test, composition]. Jamais importé par l’application : seulement par les specs. */
const SAMPLES: Record<TeaKey, readonly [string, readonly string[]]> = {
  green: ['B0TESTTE01', ['Thé vert sencha']],
  matcha: ['B0TESTTE02', ['Thé vert matcha en poudre']],
  white: ['B0TESTTE03', ['Thé blanc Bai Mu Dan']],
  oolong: ['B0TESTTE04', ['Thé oolong']],
  black: ['B0TESTTE05', ['Thé noir Assam']],
  chai: ['B0TESTTE06', ['Thé noir Assam']],
  puerh: ['B0TESTTE07', ['Thé pu-erh']],
  rooibos: ['B0TESTTE08', ['Rooibos']],
  chamomile: ['B0TESTTE09', ['Camomille']],
  mint: ['B0TESTTE10', ['Menthe poivrée']],
  verbena: ['B0TESTTE11', ['Verveine']],
  fruit: ['B0TESTTE12', ['Hibiscus', 'Pomme', 'Églantier']],
};

/** Un produit valide par type, pour tester les règles sans dépendre du vrai catalogue. */
export const FIXTURE_CATALOGUE: readonly Product[] = (
  Object.entries(SAMPLES) as [TeaKey, (typeof SAMPLES)[TeaKey]][]
).map(([tea, [asin, ingredients]]) => ({
  id: `exemple-${tea}`,
  name: `Exemple ${tea}`,
  brand: 'Maison Exemple',
  tea,
  asin,
  ingredients,
  flavoured: false,
  sourceUrl: `https://exemple.test/${tea}`,
  validated: '2026-10-20',
}));

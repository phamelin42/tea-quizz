import type { GearKey, TeaKey } from './content';
import type { GearProduct, Product } from './products';

/** Pour chaque clé : [ASIN de test, composition]. Jamais importé par l’application : seulement par les specs. */
const SAMPLES: Record<TeaKey, readonly [string, readonly string[]]> = {
  green: ['B0TESTTE01', ['Thé vert sencha']],
  matcha: ['B0TESTTE02', ['Thé vert matcha en poudre']],
  white: ['B0TESTTE03', ['Thé blanc Bai Mu Dan']],
  oolong: ['B0TESTTE04', ['Thé oolong']],
  black: ['B0TESTTE05', ['Thé noir Assam']],
  chai: ['B0TESTTE06', ['Thé noir Assam', 'Cannelle', 'Cardamome', 'Gingembre', 'Clou de girofle']],
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
  // Un chai est un thé noir épicé : sans saveur ajoutée, ce ne serait pas un chai.
  flavoured: tea === 'chai',
  sourceUrl: `https://exemple.test/${tea}`,
  validated: '2026-10-20',
}));

/** Un thé vert parfumé au jasmin : « avec de la saveur », donc écarté d’une carte « pur ». Hors de FIXTURE_CATALOGUE, qui garde un produit par type. */
export const FLAVOURED_GREEN: Product = {
  id: 'exemple-green-jasmin',
  name: 'Exemple thé vert au jasmin',
  brand: 'Maison Exemple',
  tea: 'green',
  asin: 'B0TESTTE13',
  ingredients: ['Thé vert sencha', 'Fleurs de jasmin'],
  flavoured: true,
  sourceUrl: 'https://exemple.test/green-jasmin',
  validated: '2026-10-20',
};

const GEAR_SAMPLES: Record<GearKey, readonly [string, readonly string[]]> = {
  whisk: ['B0TESTGE01', ['Bambou', '100 brins']],
  carafe: ['B0TESTGE02', ['Verre', 'Contenance 1 L']],
  gaiwan: ['B0TESTGE03', ['Porcelaine', 'Contenance 150 ml']],
  infuser: ['B0TESTGE04', ['Acier inoxydable', 'Panier de 8 cm']],
};

/** Un accessoire valide par matériel, pour tester les règles sans dépendre du vrai catalogue. */
export const FIXTURE_GEAR_CATALOGUE: readonly GearProduct[] = (
  Object.entries(GEAR_SAMPLES) as [GearKey, (typeof GEAR_SAMPLES)[GearKey]][]
).map(([gear, [asin, details]]) => ({
  id: `exemple-${gear}`,
  name: `Exemple ${gear}`,
  brand: 'Atelier Exemple',
  gear,
  asin,
  details,
  sourceUrl: `https://exemple.test/${gear}`,
  validated: '2026-10-21',
}));

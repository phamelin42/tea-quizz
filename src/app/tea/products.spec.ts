import { TEAS, type TeaKey } from './content';
import { FIXTURE_CATALOGUE, FLAVOURED_GREEN } from './products.fixture';
import {
  AFFILIATE_NOTICE,
  AFFILIATE_TAG,
  amazonUrl,
  catalogueDefects,
  EXAMPLES_NOTE,
  examplesFor,
  mentionsBrand,
  type Product,
} from './products';
import { analyse, type Answers, labelHints, type TeaCard, teas } from './profile';
import { type QuestionId, QUESTIONS } from './questions';

/** Réponses par valeur ; les questions non précisées prennent leur première option. */
function answers(values: Partial<Record<QuestionId, string>> = {}): Answers {
  return QUESTIONS.map((question) => {
    const value = values[question.id];
    if (value === undefined) return 0;
    const index = question.options.findIndex((option) => option.value === value);
    if (index < 0) throw new Error(`${question.id} n’a pas d’option ${value}`);
    return index;
  });
}

function product(tea: TeaKey): Product {
  const found = FIXTURE_CATALOGUE.find((item) => item.tea === tea);
  if (!found) throw new Error(`La fixture n’a pas de produit pour ${tea}`);
  return found;
}

/** La fixture dont un produit (le premier) est modifié. */
function withFirst(change: Partial<Product>): Product[] {
  return [{ ...FIXTURE_CATALOGUE[0], ...change }, ...FIXTURE_CATALOGUE.slice(1)];
}

/** Une carte de thé, avec la clé `tea` voulue. */
function cardFor(tea: TeaKey | undefined): TeaCard {
  return { ...teas(analyse(answers()))[0], tea };
}

const LEAF_PROFILE = analyse(answers({ moment: 'morning', caffeine: 'love' }));
const HERBAL_PROFILE = analyse(answers({ caffeine: 'none' }));

describe('textes', () => {
  it('garde la mention d’affiliation et la précision sur les exemples telles que Phil les a fixées', () => {
    expect(AFFILIATE_NOTICE).toBe(
      'En tant que Partenaire Amazon, je réalise un bénéfice sur les achats remplissant les conditions requises.',
    );
    expect(EXAMPLES_NOTE).toBe(
      'Exemples dont la composition correspond au type évoqué, présentés sans classement.',
    );
  });
});

describe('amazonUrl', () => {
  it('construit le lien amazon.fr avec le tag d’affiliation', () => {
    expect(AFFILIATE_TAG).toBe('phamelin-21');
    expect(amazonUrl('B0TESTTE01')).toBe('https://www.amazon.fr/dp/B0TESTTE01?tag=phamelin-21');
  });
});

describe('fixture', () => {
  it('a un produit par thé et par infusion', () => {
    expect(FIXTURE_CATALOGUE.map((item) => item.tea).sort()).toEqual(Object.keys(TEAS).sort());
  });
});

describe('catalogueDefects', () => {
  it('ne signale rien pour un catalogue valide', () => {
    expect(catalogueDefects(FIXTURE_CATALOGUE)).toEqual([]);
    expect(catalogueDefects([])).toEqual([]);
  });

  it('signale un ASIN en minuscules', () => {
    expect(catalogueDefects(withFirst({ asin: 'b0testte01' }))).toEqual([
      expect.stringContaining('ASIN'),
    ]);
  });

  it('signale un ASIN de 11 caractères', () => {
    expect(catalogueDefects(withFirst({ asin: 'B0TESTTE011' }))).toEqual([
      expect.stringContaining('ASIN'),
    ]);
  });

  it('signale une source qui n’est pas en https', () => {
    expect(catalogueDefects(withFirst({ sourceUrl: 'http://exemple.test/vert' }))).toEqual([
      expect.stringContaining('source'),
    ]);
  });

  it('signale une date qui n’est pas au format AAAA-MM-JJ', () => {
    expect(catalogueDefects(withFirst({ validated: '20/10/2026' }))).toEqual([
      expect.stringContaining('date'),
    ]);
  });

  it('signale un id en double', () => {
    const [first, ...rest] = FIXTURE_CATALOGUE;
    expect(catalogueDefects([first, { ...rest[0], id: first.id }, ...rest.slice(1)])).toEqual([
      expect.stringContaining('id'),
    ]);
  });

  it('signale un type de thé inconnu', () => {
    expect(catalogueDefects(withFirst({ tea: 'cafe' as TeaKey }))).toEqual([
      expect.stringContaining('type'),
    ]);
  });

  it('signale une composition vide', () => {
    expect(catalogueDefects(withFirst({ ingredients: [] }))).toEqual([
      expect.stringContaining('composition'),
    ]);
    expect(catalogueDefects(withFirst({ tea: 'mint', ingredients: [] }))).toEqual([
      expect.stringContaining('composition'),
    ]);
  });

  it('signale une infusion dont la composition contient du thé', () => {
    for (const ingredient of ['Camellia sinensis', 'Thé vert', 'The noir', 'Green tea', 'THÉ']) {
      expect(
        catalogueDefects(withFirst({ tea: 'rooibos', ingredients: ['Rooibos', ingredient] })),
        ingredient,
      ).toEqual([expect.stringContaining('infusion')]);
    }
  });

  it('signale une infusion dont la composition contient une autre plante à caféine', () => {
    for (const ingredient of [
      'Maté vert',
      'Mate',
      'Yerba maté',
      'Guarana',
      'Guaraná',
      'Guayusa',
      'Noix de kola',
      'Cola',
      'Café vert',
      'Coffee cherry',
      'Yaupon',
      'Caféine',
      'Caffeine',
    ]) {
      expect(
        catalogueDefects(withFirst({ tea: 'fruit', ingredients: ['Hibiscus', ingredient] })),
        ingredient,
      ).toEqual([expect.stringContaining('infusion')]);
    }
  });

  it('ne prend pas un mot voisin pour une plante à caféine dans une infusion', () => {
    for (const ingredient of ['Menthe poivrée', 'Camomille', 'Chocolat', 'Décaféiné', 'Mathéo']) {
      expect(
        catalogueDefects(withFirst({ tea: 'fruit', ingredients: ['Hibiscus', ingredient] })),
        ingredient,
      ).toEqual([]);
    }
  });

  it('ne prend pas un mot qui contient « thé » pour du thé dans une infusion', () => {
    expect(
      catalogueDefects(withFirst({ tea: 'mint', ingredients: ['Menthe poivrée', 'Mathéo'] })),
    ).toEqual([]);
  });

  it('signale un thé dont aucun ingrédient n’est du thé', () => {
    expect(catalogueDefects(withFirst({ tea: 'green', ingredients: ['Rooibos'] }))).toEqual([
      expect.stringContaining('thé'),
    ]);
  });

  it('ne prend pas un mot qui contient « thé » pour du thé, comme « menthe »', () => {
    for (const ingredient of ['Menthe poivrée', 'Menthe']) {
      expect(
        catalogueDefects(withFirst({ tea: 'green', ingredients: [ingredient] })),
        ingredient,
      ).toEqual([expect.stringContaining('thé')]);
    }
  });

  it('reconnaît comme thé les compositions usuelles', () => {
    for (const ingredient of [
      'Thé noir',
      'Thé pu-erh',
      'Camellia sinensis',
      'Matcha',
      'Green tea',
    ]) {
      expect(
        catalogueDefects(withFirst({ tea: 'black', ingredients: [ingredient] })),
        ingredient,
      ).toEqual([]);
    }
  });

  it('accepte matcha et pu-erh comme thés', () => {
    expect(catalogueDefects(withFirst({ tea: 'matcha', ingredients: ['Matcha'] }))).toEqual([]);
    expect(catalogueDefects(withFirst({ tea: 'puerh', ingredients: ['Pu-erh'] }))).toEqual([]);
    expect(catalogueDefects(withFirst({ tea: 'puerh', ingredients: ['Puerh'] }))).toEqual([]);
  });

  it('signale un chai qui n’est pas « avec de la saveur » : sans épices, ce n’est pas un chai', () => {
    expect(product('chai').flavoured).toBe(true);
    expect(
      catalogueDefects([{ ...product('chai'), flavoured: false, ingredients: ['Thé noir'] }]),
    ).toEqual([expect.stringContaining('chai')]);
    expect(catalogueDefects([product('chai')])).toEqual([]);
  });

  it('signale un thé sans saveur ajoutée dont la composition a plusieurs ingrédients', () => {
    expect(
      catalogueDefects(withFirst({ ingredients: ['Thé vert sencha', 'Sucre de canne'] })),
    ).toEqual([expect.stringContaining('plusieurs ingrédients')]);
    // Le même thé écrit deux fois ne fait pas deux ingrédients.
    expect(
      catalogueDefects(withFirst({ tea: 'black', ingredients: ['Thé noir', 'Thé noir*'] })),
    ).toEqual([]);
  });

  it('tolère « bio », l’astérisque et un qualificatif entre parenthèses sur un thé seul', () => {
    for (const ingredients of [
      ['Thé vert bio'],
      ['Thé vert*'],
      ['Thé vert (Chine)'],
      ['Thé vert bio (Chine)*'],
      ['Thé vert*', '*issu de l’agriculture biologique'],
      ['Thé vert', 'bio'],
    ]) {
      expect(catalogueDefects(withFirst({ ingredients })), ingredients.join(', ')).toEqual([]);
    }
  });

  it('accepte un thé aromatisé qui a plusieurs ingrédients', () => {
    expect(catalogueDefects([FLAVOURED_GREEN])).toEqual([]);
  });

  // Un seul ingrédient par chaîne : la règle du nombre d’ingrédients ne peut pas masquer le mot-clé.
  it('signale chaque arôme, épice, fruit ou fleur ajouté à un thé « sans saveur »', () => {
    for (const flavour of [
      'arôme naturel',
      'arômes',
      'aroma',
      'aromatisé',
      'natural flavour',
      'flavor',
      'saveur',
      'cannelle',
      'cinnamon',
      'cardamome',
      'gingembre',
      'clou de girofle',
      'vanille',
      'vanilla',
      'bergamote',
      'bergamot',
      'Earl Grey',
      'zeste de citron',
      'écorces d’orange',
      'fruits',
      'fleurs',
      'pétales',
      'menthe',
      'rose',
      'jasmin',
      'épices',
      'parfumé',
      'caramel',
      'chocolat',
      'pêche',
      'fraise',
      'cerise',
      'framboise',
      'mangue',
    ]) {
      const ingredient = `Thé vert ${flavour}`;
      expect(catalogueDefects(withFirst({ ingredients: [ingredient] })), ingredient).toEqual([
        expect.stringContaining(`annonce « ${ingredient} »`),
      ]);
    }
  });

  it('signale aussi un arôme ou une épice écrit seul à côté du thé', () => {
    for (const ingredient of ['Arôme naturel', 'Cannelle', 'Pétales de rose et de bleuet']) {
      expect(
        catalogueDefects(withFirst({ ingredients: ['Thé vert', ingredient] })),
        ingredient,
      ).toEqual([expect.stringContaining(`annonce « ${ingredient} »`)]);
    }
  });

  it('ne prend pas pour une saveur ajoutée les thés nature usuels', () => {
    for (const ingredient of [
      'Thé noir Assam',
      'Thé vert Gunpowder',
      'Thé vert Sencha',
      'Thé noir Ceylan',
      'Thé blanc Bai Mu Dan',
      'Thé oolong Tie Guan Yin',
      'Thé noir Assam Orange Pekoe',
    ]) {
      expect(catalogueDefects(withFirst({ ingredients: [ingredient] })), ingredient).toEqual([]);
    }
  });

  it('ne prend pas « Orange Pekoe », un grade de feuille, pour une orange ajoutée', () => {
    expect(
      catalogueDefects(withFirst({ tea: 'black', ingredients: ['Thé noir Assam Orange Pekoe'] })),
    ).toEqual([]);
  });

  it('ne signale qu’une fois un thé « sans saveur » qui a un arôme et plusieurs ingrédients', () => {
    expect(
      catalogueDefects(withFirst({ ingredients: ['Thé vert', 'Arôme naturel de jasmin'] })),
    ).toEqual([expect.stringContaining('annonce')]);
  });

  it('signale une infusion « sans saveur » dont la composition annonce un arôme', () => {
    for (const ingredient of ['Arôme naturel', 'Arômes de vanille', 'Aroma', 'Flavouring']) {
      expect(
        catalogueDefects(withFirst({ tea: 'fruit', ingredients: ['Hibiscus', ingredient] })),
        ingredient,
      ).toEqual([expect.stringContaining(`annonce « ${ingredient} »`)]);
    }
  });

  it('laisse à une infusion ses plantes, fruits et fleurs sans les prendre pour une saveur ajoutée', () => {
    expect(
      catalogueDefects(
        withFirst({
          tea: 'fruit',
          ingredients: ['Hibiscus', 'Citron', 'Pétales de rose', 'Menthe'],
        }),
      ),
    ).toEqual([]);
  });

  it('accepte une infusion « avec de la saveur » qui annonce un arôme', () => {
    expect(
      catalogueDefects(
        withFirst({ tea: 'fruit', ingredients: ['Hibiscus', 'Arôme naturel'], flavoured: true }),
      ),
    ).toEqual([]);
  });
});

describe('examplesFor', () => {
  it('ne renvoie que les produits du thé de la carte', () => {
    const extra: Product = { ...product('green'), id: 'exemple-green-2' };
    const found = examplesFor(cardFor('green'), LEAF_PROFILE, [...FIXTURE_CATALOGUE, extra]);
    expect(found.map((item) => item.id)).toEqual(['exemple-green', 'exemple-green-2']);
    for (const item of found) expect(item.tea).toBe('green');
  });

  it('ne renvoie rien pour une carte sans thé, comme le matériel', () => {
    const gear = teas(HERBAL_PROFILE).find((card) => card.key === 'gear');
    expect(gear?.tea).toBeUndefined();
    expect(examplesFor(gear as TeaCard, HERBAL_PROFILE, FIXTURE_CATALOGUE)).toEqual([]);
    expect(examplesFor(cardFor(undefined), LEAF_PROFILE, FIXTURE_CATALOGUE)).toEqual([]);
  });

  it('exclut tout thé quand la caféine est écartée', () => {
    expect(HERBAL_PROFILE.caffeine).toBe('none');
    for (const key of Object.keys(TEAS) as TeaKey[]) {
      const found = examplesFor(cardFor(key), HERBAL_PROFILE, FIXTURE_CATALOGUE);
      expect(found.length > 0, key).toBe(!TEAS[key].caffeine);
    }
  });

  it('exclut les produits aromatisés quand le repère « pur » est affiché', () => {
    expect(labelHints(LEAF_PROFILE).map((hint) => hint.key)).toContain('pure');
    const flavoured: Product = {
      ...product('black'),
      id: 'exemple-black-aromatise',
      flavoured: true,
    };
    const found = examplesFor(cardFor('black'), LEAF_PROFILE, [flavoured, product('black')]);
    expect(found.map((item) => item.id)).toEqual(['exemple-black']);
  });

  it('garde le chai, aromatisé par nature, même quand le repère « pur » est affiché', () => {
    expect(labelHints(LEAF_PROFILE).map((hint) => hint.key)).toContain('pure');
    expect(product('chai').flavoured).toBe(true);
    const found = examplesFor(cardFor('chai'), LEAF_PROFILE, FIXTURE_CATALOGUE);
    expect(found.map((item) => item.id)).toEqual(['exemple-chai']);
  });

  it('écarte toujours un thé vert aromatisé d’une carte de thé vert « pur »', () => {
    const found = examplesFor(cardFor('green'), LEAF_PROFILE, [FLAVOURED_GREEN, product('green')]);
    expect(found.map((item) => item.id)).toEqual(['exemple-green']);
    expect(examplesFor(cardFor('green'), LEAF_PROFILE, [FLAVOURED_GREEN])).toEqual([]);
  });

  it('ne fait pas du chai une exception pour un autre thé : un thé noir aromatisé reste écarté', () => {
    const flavouredBlack: Product = { ...product('black'), id: 'noir-aromatise', flavoured: true };
    expect(examplesFor(cardFor('black'), LEAF_PROFILE, [flavouredBlack])).toEqual([]);
  });

  it('garde les produits aromatisés quand le repère « pur » n’est pas affiché', () => {
    expect(labelHints(HERBAL_PROFILE).map((hint) => hint.key)).not.toContain('pure');
    const flavoured: Product = {
      ...product('rooibos'),
      id: 'exemple-rooibos-aromatise',
      flavoured: true,
    };
    const found = examplesFor(cardFor('rooibos'), HERBAL_PROFILE, [flavoured, product('rooibos')]);
    expect(found.map((item) => item.id)).toEqual(['exemple-rooibos-aromatise', 'exemple-rooibos']);
  });

  it('en garde trois au plus, dans l’ordre du catalogue', () => {
    const many = ['a', 'b', 'c', 'd', 'e'].map((suffix) => ({
      ...product('rooibos'),
      id: `exemple-rooibos-${suffix}`,
    }));
    const found = examplesFor(cardFor('rooibos'), HERBAL_PROFILE, many);
    expect(found.map((item) => item.id)).toEqual([
      'exemple-rooibos-a',
      'exemple-rooibos-b',
      'exemple-rooibos-c',
    ]);
  });

  it('ne renvoie rien avec un catalogue vide', () => {
    expect(examplesFor(cardFor('green'), LEAF_PROFILE, [])).toEqual([]);
  });
});

describe('mentionsBrand', () => {
  it('repère une marque du catalogue, quelle que soit la casse', () => {
    expect(mentionsBrand('Un sachet de la Maison Exemple', FIXTURE_CATALOGUE)).toBe(true);
    expect(mentionsBrand('un sachet de la MAISON EXEMPLE', FIXTURE_CATALOGUE)).toBe(true);
  });

  it('ne repère rien dans un texte sans marque ou avec un catalogue vide', () => {
    expect(mentionsBrand('Un thé vert', FIXTURE_CATALOGUE)).toBe(false);
    expect(mentionsBrand('Maison Exemple', [])).toBe(false);
  });
});

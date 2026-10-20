import { InjectionToken } from '@angular/core';
import { TEAS, type TeaKey } from './content';
import { labelHints, type Profile, type TeaCard } from './profile';

/** Défini ici seulement : le tag d’affiliation Partenaires Amazon du site. */
export const AFFILIATE_TAG = 'phamelin-21';

export const AFFILIATE_NOTICE =
  'En tant que Partenaire Amazon, je réalise un bénéfice sur les achats remplissant les conditions requises.';

export const EXAMPLES_NOTE =
  'Exemples dont la composition correspond au type évoqué, présentés sans classement.';

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly brand: string;
  /** Type de thé ou d’infusion illustré. */
  readonly tea: TeaKey;
  readonly asin: string;
  /** Composition recopiée de la fiche du fabricant. */
  readonly ingredients: readonly string[];
  /**
   * « Avec de la saveur » : vrai dès qu’une saveur est ajoutée au thé ou à la plante (arôme,
   * épice, fruit, fleur, morceaux), pas seulement un arôme. Faux quand la composition se limite
   * au thé ou à la plante elle-même.
   */
  readonly flavoured: boolean;
  readonly sourceUrl: string;
  /** Date de validation du lien par Phil (AAAA-MM-JJ). */
  readonly validated: string;
}

/** Vide tant que Phil n’a pas ouvert et validé chaque lien Amazon : aucun ASIN ne se devine. */
export const CATALOGUE: readonly Product[] = [];

/** Jeton plutôt qu’import direct, pour que les tests fournissent leur propre catalogue. */
export const PRODUCT_CATALOGUE = new InjectionToken<readonly Product[]>('PRODUCT_CATALOGUE', {
  providedIn: 'root',
  factory: () => CATALOGUE,
});

/**
 * Les thés dont la recette est un mélange : sans épices, ce ne serait pas un chai. Ils sont donc
 * « avec de la saveur » par nature, et la carte « pur » (qui écarte les produits aromatisés pour
 * montrer le thé lui-même) ne doit pas les écarter, sans quoi elle ne montrerait jamais de chai.
 */
const NATURALLY_FLAVOURED: readonly TeaKey[] = ['chai'];

const MAX_EXAMPLES = 3;
const ASIN = /^[A-Z0-9]{10}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
/**
 * Une infusion n’a ni théine ni caféine : tout ce qui évoque le théier, ou une autre plante à
 * caféine (maté, guarana, guayusa, kola, café, yaupon), la disqualifie, sans quoi `examplesFor` la
 * montrerait à qui a écarté la caféine. Les bornes sont des lookarounds Unicode, car `\b` ne voit
 * pas « é » comme une lettre et manquerait « Thé vert » ; elles évitent aussi « Menthe », « Mathéo »,
 * « Chocolat » ou « Décaféiné ».
 */
const TEA_IN_HERBAL =
  /camellia|caf[ée]ine|caffeine|(?<!\p{L})(?:th[ée]|tea|mat[ée]|yerba|guaran[aá]|guayusa|[ck]ola|caf[ée]|coffee|yaupon)(?!\p{L})/iu;
/** Mêmes bornes que ci-dessus : sans elles, « Menthe » (« nthe ») passerait pour du thé. */
const TEA_IN_LEAF = /camellia|(?<!\p{L})th[ée](?!\p{L})|(?<!\p{L})tea(?!\p{L})|matcha|pu-?erh/iu;

/**
 * Un arôme ou une saveur annoncés : interdit dans un produit « sans saveur », thé ou infusion.
 * Même bornes Unicode que ci-dessus, posées au début seulement pour couvrir « arômes », « saveurs ».
 */
const AROMA = /(?<!\p{L})(?:ar[ôo]me|aroma|flavou?r|saveur)/iu;
/**
 * Ce qu’on ajoute à un thé pour le parfumer : épices, agrumes, fruits, fleurs, menthe. Réservé aux
 * thés, car ce sont les ingrédients ordinaires d’une infusion. « Orange Pekoe » est un grade de
 * feuille, pas une orange ajoutée.
 */
const ADDED_TO_LEAF =
  /(?<!\p{L})(?:cannelle|cardamome|gingembre|girofle|vanille|bergamote|citron|orange(?!\s+pekoe)|fruit|fleur|p[ée]tale|menthe|rose|jasmin|[ée]pice)/iu;
/** Note de bas de liste (« * issu de l’agriculture biologique », « bio ») : ce n’est pas un ingrédient. */
const FOOTNOTE = /^(?:\*|bio(?:logique)?$)/iu;
/** Le qualificatif de fin d’un ingrédient (« * », « (Chine) »), pour compter les ingrédients distincts. */
const QUALIFIER = /(?:\s*(?:\*+|\([^)]*\)))+$/u;

/** Le nombre d’ingrédients distincts, hors notes de bas de liste et qualificatifs. */
function distinctIngredients(ingredients: readonly string[]): number {
  return new Set(
    ingredients
      .map((ingredient) => ingredient.trim())
      .filter((ingredient) => !FOOTNOTE.test(ingredient))
      .map((ingredient) => ingredient.replace(QUALIFIER, '').trim().toLowerCase()),
  ).size;
}

/**
 * Ce qui contredit `flavoured: false`, ou `undefined` : un arôme annoncé, et pour un thé une épice,
 * un fruit ou une fleur, puis tout ingrédient en plus du thé lui-même.
 */
function addedFlavour(item: Product, leaf: boolean): string | undefined {
  const keyword = leaf ? [AROMA, ADDED_TO_LEAF] : [AROMA];
  const found = item.ingredients.find((ingredient) => keyword.some((re) => re.test(ingredient)));
  if (found) return `la composition évoque une saveur ajoutée (${found})`;
  if (leaf && distinctIngredients(item.ingredients) > 1) {
    return 'un thé sans saveur ajoutée n’a qu’un ingrédient, le thé lui-même';
  }
  return undefined;
}

export function amazonUrl(asin: string): string {
  return `https://www.amazon.fr/dp/${asin}?tag=${AFFILIATE_TAG}`;
}

/**
 * Les règles qui ne dépendent pas du profil, vérifiées sur tout le catalogue ;
 * celles qui en dépendent (caféine, thé « pur ») sont appliquées par `examplesFor`.
 */
export function catalogueDefects(catalogue: readonly Product[]): string[] {
  const defects: string[] = [];
  const seen = new Set<string>();
  for (const item of catalogue) {
    const where = item.id;
    if (seen.has(item.id)) defects.push(`${where} : id en double`);
    seen.add(item.id);
    if (!ASIN.test(item.asin)) defects.push(`${where} : ASIN invalide (${item.asin})`);
    if (!item.sourceUrl.startsWith('https://')) defects.push(`${where} : source hors https`);
    if (!DATE.test(item.validated) || Number.isNaN(Date.parse(item.validated))) {
      defects.push(`${where} : date de validation invalide (${item.validated})`);
    }
    if (!Object.hasOwn(TEAS, item.tea)) {
      defects.push(`${where} : type de thé inconnu (${item.tea})`);
      continue;
    }
    if (item.ingredients.length === 0) {
      defects.push(`${where} : composition vide`);
      continue;
    }
    if (NATURALLY_FLAVOURED.includes(item.tea) && !item.flavoured) {
      defects.push(
        `${where} : un ${item.tea} sans épices n’est pas un ${item.tea} (flavoured doit être vrai)`,
      );
    }
    const leaf = TEAS[item.tea].caffeine;
    if (leaf) {
      if (!item.ingredients.some((ingredient) => TEA_IN_LEAF.test(ingredient))) {
        defects.push(`${where} : un thé doit contenir du thé`);
        continue;
      }
    } else if (item.ingredients.some((ingredient) => TEA_IN_HERBAL.test(ingredient))) {
      defects.push(`${where} : une infusion ne contient ni thé ni plante à caféine`);
    }
    const added = item.flavoured ? undefined : addedFlavour(item, leaf);
    if (added) defects.push(`${where} : flavoured est faux mais ${added}`);
  }
  return defects;
}

/** Au plus trois produits du thé de la carte, filtrés selon les règles du profil, dans l’ordre du catalogue. */
export function examplesFor(
  card: TeaCard,
  profile: Profile,
  catalogue: readonly Product[],
): Product[] {
  if (!card.tea) return [];
  const pure = labelHints(profile).some((hint) => hint.key === 'pure');
  return catalogue
    .filter((item) => item.tea === card.tea)
    .filter((item) => profile.caffeine !== 'none' || !TEAS[item.tea].caffeine)
    .filter((item) => !pure || !item.flavoured || NATURALLY_FLAVOURED.includes(item.tea))
    .slice(0, MAX_EXAMPLES);
}

/** Les marques ne vivent que dans le catalogue : les textes éditoriaux n’en citent aucune. */
export function mentionsBrand(text: string, catalogue: readonly Product[]): boolean {
  const lower = text.toLowerCase();
  return catalogue.some((item) => item.brand !== '' && lower.includes(item.brand.toLowerCase()));
}

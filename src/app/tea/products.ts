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
  /** Vrai si le produit contient des arômes ou des ajouts. */
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

const MAX_EXAMPLES = 3;
const ASIN = /^[A-Z0-9]{10}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
/**
 * Une infusion n’a pas de théine : tout ce qui évoque le théier la disqualifie. Les bornes sont des
 * lookarounds Unicode, car `\b` ne voit pas « é » comme une lettre et manquerait « Thé vert ».
 */
const TEA_IN_HERBAL = /camellia|(?<!\p{L})th[ée](?!\p{L})|(?<!\p{L})tea(?!\p{L})/iu;
const TEA_IN_LEAF = /camellia|th[ée]|\btea\b|matcha|pu-?erh/i;

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
    if (TEAS[item.tea].caffeine) {
      if (!item.ingredients.some((ingredient) => TEA_IN_LEAF.test(ingredient))) {
        defects.push(`${where} : un thé doit contenir du thé`);
      }
    } else if (item.ingredients.some((ingredient) => TEA_IN_HERBAL.test(ingredient))) {
      defects.push(`${where} : une infusion ne contient pas de thé`);
    }
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
    .filter((item) => !pure || !item.flavoured)
    .slice(0, MAX_EXAMPLES);
}

/** Les marques ne vivent que dans le catalogue : les textes éditoriaux n’en citent aucune. */
export function mentionsBrand(text: string, catalogue: readonly Product[]): boolean {
  const lower = text.toLowerCase();
  return catalogue.some((item) => item.brand !== '' && lower.includes(item.brand.toLowerCase()));
}

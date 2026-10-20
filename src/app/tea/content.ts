import type { FdCardSky, FdEmblemName } from '@phamelin/fuda';

/** Thés issus du théier (Camellia sinensis), donc avec caféine. */
export type LeafTea = 'green' | 'matcha' | 'white' | 'oolong' | 'black' | 'chai' | 'puerh';
/** Infusions de plantes, de fleurs ou de fruits : pas du thé, pas de caféine. */
export type HerbalTea = 'rooibos' | 'chamomile' | 'mint' | 'verbena' | 'fruit';
export type TeaKey = LeafTea | HerbalTea;
export type Family = 'green' | 'delicate' | 'bold' | 'deep' | 'herbal';
export type Moment = 'morning' | 'afternoon' | 'meal' | 'evening';
export type Serving = 'hot' | 'iced' | 'both';
export type Experience = 'new' | 'bags' | 'leaves' | 'expert';
export type TipKey = 'pure' | 'origin' | 'whole' | 'low' | 'plantPart' | 'decaf';
export type GearKey = 'whisk' | 'carafe' | 'gaiwan' | 'infuser';

export interface Tea {
  readonly family: Family;
  /** Titre de la carte. */
  readonly title: string;
  readonly flavour: string;
  readonly why: string;
  readonly caffeine: boolean;
  readonly temperature: string;
  /** Durée d’infusion en toutes lettres, puis abrégée pour la routine. */
  readonly infusion: string;
  readonly infusionShort: string;
  /** Mots à repérer sur le paquet. */
  readonly labels: readonly string[];
  readonly sky: FdCardSky;
  readonly emblem: FdEmblemName;
  readonly note?: string;
}

export const TEAS: Record<TeaKey, Tea> = {
  green: {
    family: 'green',
    title: 'Un thé vert',
    flavour: 'Végétal et frais, parfois iodé ou noisette',
    why: 'Feuilles non oxydées : on les chauffe, à la vapeur au Japon, à la poêle en Chine, pour arrêter l’oxydation. L’amertume vient surtout d’une eau trop chaude ou d’une infusion trop longue.',
    caffeine: true,
    temperature: '70 à 80 °C',
    infusion: '1 à 2 minutes',
    infusionShort: '1 à 2 min',
    labels: ['Thé vert', 'Sencha', 'Date de récolte'],
    sky: 'tokiwa',
    emblem: 'cho',
  },
  matcha: {
    family: 'green',
    title: 'Un matcha',
    flavour: 'Végétal, rond, légèrement amer',
    why: 'Poudre de feuilles ombragées avant la récolte. On boit la feuille entière : la tasse contient en général plus de caféine qu’un thé vert infusé.',
    caffeine: true,
    temperature: '70 à 80 °C',
    infusion: '20 secondes au fouet',
    infusionShort: '20 s',
    labels: ['Matcha', 'Thé vert en poudre', 'Origine indiquée'],
    sky: 'tokiwa',
    emblem: 'koi',
  },
  white: {
    family: 'delicate',
    title: 'Un thé blanc',
    flavour: 'Doux, floral, parfois miellé',
    why: 'Thé très peu transformé : des bourgeons et de jeunes feuilles simplement flétris puis séchés. Il est peu astringent et se boit nature.',
    caffeine: true,
    temperature: '80 °C environ',
    infusion: '3 à 4 minutes',
    infusionShort: '3 à 4 min',
    labels: ['Thé blanc', 'Bai Mu Dan', 'Yin Zhen'],
    sky: 'sakura',
    emblem: 'sakura',
  },
  oolong: {
    family: 'delicate',
    title: 'Un oolong',
    flavour: 'Floral et crémeux, ou boisé et torréfié',
    why: 'Thé partiellement oxydé, entre le vert et le noir. La famille est large : des oolongs légers et floraux aux oolongs torréfiés, plus boisés. Les mêmes feuilles se réinfusent plusieurs fois.',
    caffeine: true,
    temperature: '90 à 95 °C',
    infusion: '2 à 4 minutes',
    infusionShort: '2 à 4 min',
    labels: ['Oolong', 'Tie Guan Yin', 'Da Hong Pao'],
    sky: 'fuji',
    emblem: 'fuji',
  },
  black: {
    family: 'bold',
    title: 'Un thé noir',
    flavour: 'Malté, corsé, parfois fruité ou miellé',
    why: 'Feuilles entièrement oxydées : la saveur est plus pleine et le thé reste agréable avec un nuage de lait. Il pardonne assez bien une eau très chaude.',
    caffeine: true,
    temperature: '95 à 100 °C',
    infusion: '3 à 5 minutes',
    infusionShort: '3 à 5 min',
    labels: ['Thé noir', 'Assam', 'Ceylan', 'Darjeeling'],
    sky: 'yamabuki',
    emblem: 'momiji',
  },
  chai: {
    family: 'bold',
    title: 'Un chai',
    flavour: 'Épicé, rond, réchauffant',
    why: 'Thé noir mêlé d’épices, le plus souvent cardamome, cannelle, gingembre et clou de girofle. En Inde, le masala chai se prépare avec du lait.',
    caffeine: true,
    temperature: '100 °C',
    infusion: '4 à 5 minutes',
    infusionShort: '4 à 5 min',
    labels: ['Thé noir', 'Cardamome', 'Cannelle', 'Gingembre'],
    sky: 'yamabuki',
    emblem: 'kiku',
  },
  puerh: {
    family: 'deep',
    title: 'Un pu-erh',
    flavour: 'Terreux, boisé, rond',
    why: 'Thé sombre du Yunnan, fermenté puis vieilli. Il se prête à plusieurs infusions successives. Le « shou » est fermenté de façon accélérée, le « sheng » vieillit plus lentement.',
    caffeine: true,
    temperature: '95 à 100 °C',
    infusion: '3 à 5 minutes',
    infusionShort: '3 à 5 min',
    labels: ['Pu-erh', 'Shou (cuit)', 'Sheng (cru)'],
    sky: 'kon',
    emblem: 'usagi',
  },
  rooibos: {
    family: 'herbal',
    title: 'Un rooibos',
    flavour: 'Doux, boisé, légèrement miellé',
    why: 'Plante d’Afrique du Sud (Aspalathus linearis) : ce n’est pas un thé, et elle ne contient naturellement pas de caféine. Il supporte bien le lait et les épices.',
    caffeine: false,
    temperature: '100 °C',
    infusion: '5 à 7 minutes',
    infusionShort: '5 à 7 min',
    labels: ['Rooibos', 'Aspalathus linearis', 'Sans théine'],
    sky: 'yamabuki',
    emblem: 'inu',
  },
  chamomile: {
    family: 'herbal',
    title: 'Une camomille',
    flavour: 'Floral, légèrement pommé et miellé',
    why: 'Fleurs de camomille matricaire (Matricaria chamomilla), sans caféine. Une infusion traditionnellement bue le soir.',
    caffeine: false,
    temperature: '100 °C',
    infusion: '5 à 10 minutes',
    infusionShort: '5 à 10 min',
    labels: ['Camomille matricaire', 'Matricaria chamomilla', 'Fleurs entières'],
    sky: 'sakura',
    emblem: 'ume',
    note: 'À éviter en cas d’allergie aux Astéracées (ambroisie, armoise, marguerite…).',
  },
  mint: {
    family: 'herbal',
    title: 'Une menthe poivrée',
    flavour: 'Frais, mentholé, intense',
    why: 'Feuilles de Mentha × piperita, sans caféine. Elle se boit chaude comme glacée.',
    caffeine: false,
    temperature: '100 °C',
    infusion: '5 à 7 minutes',
    infusionShort: '5 à 7 min',
    labels: ['Menthe poivrée', 'Mentha × piperita', 'Feuilles entières'],
    sky: 'asagi',
    emblem: 'tsubame',
    note: 'La menthe poivrée peut aggraver un reflux gastrique : en cas de reflux, demandez conseil.',
  },
  verbena: {
    family: 'herbal',
    title: 'Une verveine',
    flavour: 'Citronné, herbacé, doux',
    why: 'Feuilles de verveine odorante (Aloysia citrodora), sans caféine, au parfum de citron. Une infusion classique en France.',
    caffeine: false,
    temperature: '100 °C',
    infusion: '5 à 10 minutes',
    infusionShort: '5 à 10 min',
    labels: ['Verveine odorante', 'Aloysia citrodora', 'Feuilles entières'],
    sky: 'tokiwa',
    emblem: 'cho',
  },
  fruit: {
    family: 'herbal',
    title: 'Une infusion de fruits et de fleurs',
    flavour: 'Acidulé, fruité, parfumé',
    why: 'Mélange sans thé de morceaux de fruits, de fleurs et d’écorces, sans caféine. Elle est très agréable glacée. Seule la liste des ingrédients dit si le parfum vient de vrais fruits ou d’arômes.',
    caffeine: false,
    temperature: '100 °C',
    infusion: '5 à 10 minutes',
    infusionShort: '5 à 10 min',
    labels: ['Morceaux de fruits', 'Fleurs', 'Écorces'],
    sky: 'asagi',
    emblem: 'koi',
  },
};

export interface FamilyContent {
  /** Suite de « Vos réponses évoquent… ». */
  readonly phrase: string;
  readonly label: string;
  readonly emblem: FdEmblemName;
  readonly sky: FdCardSky;
  readonly text: string;
}

export const FAMILIES: Record<Family, FamilyContent> = {
  green: {
    phrase: 'un thé frais et végétal',
    label: 'Frais et végétal',
    emblem: 'cho',
    sky: 'tokiwa',
    text: 'Vos réponses penchent vers des feuilles peu transformées, aux saveurs d’herbe fraîche et de légumes verts, parfois d’algue ou de noisette. L’enjeu est surtout la préparation : une eau trop chaude les rend vite amères.',
  },
  delicate: {
    phrase: 'un thé délicat et floral',
    label: 'Délicat et floral',
    emblem: 'sakura',
    sky: 'sakura',
    text: 'Vos réponses penchent vers des thés légers, aux notes de fleurs, de fruits ou de miel, peu astringents. Ils aiment une eau moins chaude et se boivent nature, pour en goûter les nuances.',
  },
  bold: {
    phrase: 'un thé corsé et réconfortant',
    label: 'Corsé et réconfortant',
    emblem: 'momiji',
    sky: 'yamabuki',
    text: 'Vos réponses penchent vers des thés pleins en bouche, aux notes maltées, boisées ou épicées, qui supportent bien le lait. Ils sont plutôt indulgents : une eau bouillante et quelques minutes suffisent.',
  },
  deep: {
    phrase: 'un thé profond et boisé',
    label: 'Profond et boisé',
    emblem: 'fuji',
    sky: 'kon',
    text: 'Vos réponses penchent vers des thés fermentés ou torréfiés, aux saveurs de sous-bois, de terre humide ou de bois. Ils se prêtent à des infusions successives, pour prendre son temps.',
  },
  herbal: {
    phrase: 'plutôt une infusion, sans caféine',
    label: 'Infusion sans caféine',
    emblem: 'ume',
    sky: 'asagi',
    text: 'Vos réponses penchent vers des plantes, des fleurs ou des fruits infusés. Ce ne sont pas des thés : ils ne viennent pas du théier et ne contiennent pas de caféine, ce qui permet de les boire à toute heure.',
  },
};

export const MOMENT_LABELS: Record<Moment, string> = {
  morning: 'Le matin',
  afternoon: 'En début d’après-midi',
  meal: 'Après le repas',
  evening: 'Le soir',
};

export const SERVING_LABELS: Record<Serving, string> = {
  hot: 'Chaud',
  iced: 'Glacé',
  both: 'Chaud ou glacé',
};

export const START_ADVICE: Record<Experience, string> = {
  new: 'Vous débutez : commencez par un seul thé de bonne qualité, de préférence en feuilles entières, et notez ce que vous aimez (eau, durée, quantité) avant d’en essayer un autre.',
  bags: 'Vous buvez surtout du sachet : essayez la même famille en feuilles entières avec un infuseur. Elles laissent en général plus de place aux arômes et se réinfusent souvent.',
  leaves:
    'Vous connaissez déjà les feuilles : ne changez qu’un paramètre à la fois (température, durée ou dose) pour comprendre ce qui change dans la tasse.',
  expert:
    'Vous êtes amateur averti : gardez vos repères et comparez un autre jardin, une autre région ou une autre récolte du même type de thé.',
};

export interface LabelTip {
  readonly name: string;
  readonly why: string;
  /** Mots à repérer ; `null` quand ils viennent du thé lui-même. */
  readonly terms: readonly string[] | null;
}

export const LABEL_TIPS: Record<TipKey, LabelTip> = {
  pure: {
    name: 'Une liste d’ingrédients courte',
    why: 'Pour goûter le thé lui-même, cherchez le thé seul dans la liste. « Arôme » ou « arômes naturels » indiquent un thé aromatisé.',
    terms: null,
  },
  origin: {
    name: 'L’origine et la récolte',
    why: 'Un pays, une région ou un jardin, et si possible une date de récolte, sont des signes de traçabilité. La fraîcheur compte surtout pour les thés verts et blancs.',
    terms: ['Pays ou région', 'Date de récolte'],
  },
  whole: {
    name: 'La forme des feuilles',
    why: 'Des feuilles entières ou à peine brisées se réinfusent et gardent plus de nuances que la poussière de thé des sachets, qui infuse vite et devient amère.',
    terms: ['Feuilles entières', 'Vrac'],
  },
  low: {
    name: 'Une caféine réduite',
    why: 'Un thé « déthéiné » contient très peu de caféine, mais pas zéro. Une infusion courte en extrait aussi moins qu’une infusion longue.',
    terms: ['Déthéiné', 'Décaféiné'],
  },
  plantPart: {
    name: 'La plante, pas l’arôme',
    why: 'Pour une infusion, repérez le nom de la plante, son nom latin et la partie utilisée : feuille, fleur ou fruit. Un « arôme » ne remplace pas la plante.',
    terms: null,
  },
  decaf: {
    name: 'Sans théine',
    why: '« Théine » et caféine désignent la même molécule. « Sans théine » ne vaut que pour une plante qui n’en contient pas, pas pour un thé déthéiné, qui en garde des traces.',
    terms: ['Sans théine', 'Infusion'],
  },
};

export interface Gear {
  readonly title: string;
  readonly texture: string;
  readonly text: string;
  readonly labels: readonly string[];
  readonly sky: FdCardSky;
  readonly emblem: FdEmblemName;
}

export const GEARS: Record<GearKey, Gear> = {
  whisk: {
    title: 'Un fouet à matcha et un bol',
    texture: 'Fouet en bambou, bol large',
    text: 'Le fouet met la poudre en suspension et fait la mousse. Un bol large laisse de la place pour fouetter sans éclabousser.',
    labels: ['Chasen (fouet)', 'Chawan (bol)'],
    sky: 'tokiwa',
    emblem: 'koi',
  },
  carafe: {
    title: 'Une carafe ou une bouteille',
    texture: 'Avec couvercle, pour le réfrigérateur',
    text: 'L’infusion à froid demande de longues heures d’attente : une carafe fermée ou une bouteille avec filtre évite les odeurs du réfrigérateur.',
    labels: ['Couvercle', 'Filtre ou passoire fine'],
    sky: 'asagi',
    emblem: 'tsubame',
  },
  gaiwan: {
    title: 'Une petite théière ou un gaiwan',
    texture: 'Petit volume, plusieurs infusions',
    text: 'Avec peu d’eau et beaucoup de feuilles, on enchaîne de courtes infusions et on suit l’évolution des saveurs d’une infusion à l’autre.',
    labels: ['Gaiwan', 'Théière de 150 ml environ'],
    sky: 'kon',
    emblem: 'usagi',
  },
  infuser: {
    title: 'Un infuseur à thé',
    texture: 'Panier ou boule à large ouverture',
    text: 'Les feuilles ont besoin de place pour se déployer : préférez un panier ample à une petite boule serrée. Il se retire d’un geste, à l’heure.',
    labels: ['Panier ample', 'Mailles fines'],
    sky: 'sakura',
    emblem: 'sakura',
  },
};

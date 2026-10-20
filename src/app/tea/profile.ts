import type { FdCardSky, FdEmblemName } from '@phamelin/fuda';
import {
  type Experience,
  type Family,
  GEARS,
  type GearKey,
  type HerbalTea,
  LABEL_TIPS,
  type LeafTea,
  type Moment,
  MOMENT_LABELS,
  type Serving,
  type TeaKey,
  TEAS,
  type TipKey,
} from './content';
import { type QuestionId, QUESTIONS } from './questions';

export type CaffeineLevel = 'none' | 'low' | 'regular';
export type Cups = '1' | 'few' | 'many';
export type PrepTime = '3' | '5' | '10';

export interface Profile {
  readonly family: Family;
  readonly tea: TeaKey;
  /** Un autre thé (ou une autre infusion) à essayer, jamais le même. */
  readonly alternative: TeaKey;
  /** Une infusion sans caféine pour compléter ; `null` quand le choix principal en est déjà une. */
  readonly complement: HerbalTea | null;
  readonly caffeine: CaffeineLevel;
  /** La caféine a été écartée par la question, et non par le soir. */
  readonly caffeineRefused: boolean;
  readonly moment: Moment;
  readonly serving: Serving;
  readonly milk: 'plain' | 'milk' | 'sweet';
  readonly experience: Experience;
  readonly time: PrepTime;
  readonly cups: Cups;
}

export interface TeaCard {
  readonly key: string;
  readonly when: string;
  readonly sky: FdCardSky;
  readonly emblem: FdEmblemName;
  readonly title: string;
  readonly texture: string;
  readonly text: string;
  readonly note?: string;
  /** Le thé ou l’infusion illustré ; absent sur le matériel, qui n’a pas de produit. */
  readonly tea?: TeaKey;
  /** À chercher sur l’étiquette. */
  readonly labels: readonly string[];
}

export interface RoutineStep {
  readonly title: string;
  readonly detail: string;
  /** Vide quand la durée n’a pas de sens. */
  readonly duration: string;
}

export interface Ritual {
  readonly prepare: readonly RoutineStep[];
  readonly enjoy: readonly RoutineStep[];
}

export interface LabelHint {
  readonly key: TipKey;
  readonly name: string;
  readonly why: string;
  readonly terms: readonly string[];
}

/** Une réponse par question, dans l’ordre de `QUESTIONS` : l’indice de l’option choisie. */
export type Answers = readonly number[];

type Scores = Partial<Record<LeafTea, number>>;

/** Départage les égalités : d’abord les thés les plus faciles à réussir. */
const LEAF_ORDER: readonly LeafTea[] = [
  'black',
  'green',
  'white',
  'oolong',
  'chai',
  'matcha',
  'puerh',
];

/** Points gagnés (ou perdus) par chaque thé selon chaque réponse. */
const SCORES: Partial<Record<QuestionId, Record<string, Scores>>> = {
  moment: {
    morning: { black: 1, matcha: 1 },
    afternoon: { green: 1, oolong: 1 },
    meal: { puerh: 2, oolong: 1 },
    evening: { white: 1 },
  },
  need: {
    wake: { black: 3, matcha: 2, chai: 1 },
    focus: { matcha: 2, green: 2 },
    relax: { white: 2, oolong: 1 },
    pleasure: { oolong: 1, white: 1, black: 1 },
    comfort: { chai: 3, puerh: 1, black: 1 },
  },
  caffeine: {
    love: { black: 1, matcha: 1 },
    little: { white: 2, matcha: -3, black: -1, chai: -1 },
  },
  taste: {
    vegetal: { green: 3, matcha: 2 },
    floral: { white: 3, oolong: 2 },
    woody: { puerh: 3, black: 2, oolong: 1 },
    sweet: { black: 2, white: 1, oolong: 1 },
    spicy: { chai: 3, black: 1 },
    fresh: { green: 2, white: 1 },
    fruity: { white: 2, oolong: 1, black: 1 },
  },
  milk: {
    milk: { black: 3, chai: 3 },
    sweet: { black: 1, chai: 1 },
  },
  bitter: {
    dislike: { white: 2, oolong: 1, matcha: -2, green: -1, black: -1, puerh: -1 },
    like: { matcha: 1, green: 1, black: 1, puerh: 1 },
  },
  experience: {
    new: { black: 1, white: 1, matcha: -2, puerh: -1 },
    bags: { black: 1 },
    leaves: { oolong: 1 },
    expert: { puerh: 1, oolong: 1, matcha: 1 },
  },
  time: {
    '3': { matcha: -1, oolong: -1, puerh: -1 },
    '10': { oolong: 1, puerh: 1, matcha: 1 },
  },
  serving: {
    iced: { green: 1, white: 1, oolong: 1, black: 1, puerh: -1, chai: -2 },
  },
};

/** Infusions classées par saveur : la première est le choix, les suivantes les repli. */
const HERBALS: Record<string, readonly HerbalTea[]> = {
  vegetal: ['verbena', 'mint', 'chamomile'],
  floral: ['chamomile', 'verbena', 'fruit'],
  woody: ['rooibos', 'chamomile', 'verbena'],
  sweet: ['rooibos', 'chamomile', 'fruit'],
  spicy: ['rooibos', 'mint', 'chamomile'],
  fresh: ['mint', 'verbena', 'fruit'],
  fruity: ['fruit', 'rooibos', 'mint'],
};

export function analyse(answers: Answers): Profile {
  const value = (id: QuestionId): string => {
    const index = QUESTIONS.findIndex((question) => question.id === id);
    return QUESTIONS[index].options[answers[index]].value;
  };

  const moment = value('moment') as Moment;
  const caffeineAnswer = value('caffeine');
  const taste = value('taste');
  // Le soir, on ne propose pas de caféine à qui veut la limiter : elle met des heures à s’éliminer.
  const caffeineRefused = caffeineAnswer === 'none';
  const caffeine: CaffeineLevel =
    caffeineRefused || (moment === 'evening' && caffeineAnswer !== 'love')
      ? 'none'
      : caffeineAnswer === 'little'
        ? 'low'
        : 'regular';

  const herbals = HERBALS[taste];
  let tea: TeaKey;
  let alternative: TeaKey;
  let complement: HerbalTea | null = null;

  if (caffeine === 'none') {
    [tea, alternative] = herbals;
  } else {
    const total = new Map<LeafTea, number>(LEAF_ORDER.map((leaf) => [leaf, 0]));
    for (const id of Object.keys(SCORES) as QuestionId[]) {
      const points = SCORES[id]?.[value(id)];
      for (const [leaf, score] of Object.entries(points ?? {}) as [LeafTea, number][]) {
        total.set(leaf, total.get(leaf)! + score);
      }
    }
    // `sort` est stable : à égalité, l’ordre de `LEAF_ORDER` décide.
    const ranked = [...LEAF_ORDER].sort((a, b) => total.get(b)! - total.get(a)!);
    tea = ranked[0];
    // Une autre famille pour varier, sinon le thé suivant.
    alternative =
      ranked.slice(1).find((leaf) => TEAS[leaf].family !== TEAS[tea].family) ?? ranked[1];
    const needsHerbal =
      caffeine === 'low' ||
      value('cups') === 'many' ||
      moment === 'evening' ||
      value('need') === 'relax';
    if (needsHerbal) complement = herbals[0];
  }

  return {
    family: TEAS[tea].family,
    tea,
    alternative,
    complement,
    caffeine,
    caffeineRefused,
    moment,
    serving: value('serving') as Serving,
    milk: value('milk') as Profile['milk'],
    experience: value('experience') as Experience,
    time: value('time') as PrepTime,
    cups: value('cups') as Cups,
  };
}

export function gearFor(profile: Profile): GearKey {
  if (profile.tea === 'matcha') return 'whisk';
  if (profile.serving === 'iced') return 'carafe';
  const slow: readonly TeaKey[] = ['oolong', 'puerh', 'white', 'green'];
  if (profile.time === '10' && slow.includes(profile.tea)) return 'gaiwan';
  return 'infuser';
}

export function teas(profile: Profile): TeaCard[] {
  const card = (key: string, when: string, tea: TeaKey): TeaCard => {
    const content = TEAS[tea];
    return {
      key,
      when,
      sky: content.sky,
      emblem: content.emblem,
      title: content.title,
      texture: content.flavour,
      text: content.why,
      note: content.note,
      tea,
      labels: content.labels,
    };
  };
  const list = [
    card('main', MOMENT_LABELS[profile.moment], profile.tea),
    card('alternative', 'Pour varier', profile.alternative),
  ];
  if (profile.complement) list.push(card('complement', 'Sans caféine', profile.complement));
  const gear = GEARS[gearFor(profile)];
  list.push({
    key: 'gear',
    when: 'Le matériel',
    sky: gear.sky,
    emblem: gear.emblem,
    title: gear.title,
    texture: gear.texture,
    text: gear.text,
    labels: gear.labels,
  });
  return list;
}

/** Deux ou trois repères à vérifier sur le paquet, sans doublon. */
export function labelHints(profile: Profile): LabelHint[] {
  const tea = TEAS[profile.tea];
  const keys: TipKey[] =
    profile.family === 'herbal'
      ? ['plantPart', 'decaf']
      : profile.tea === 'matcha'
        ? ['pure', 'origin']
        : ['pure', 'whole', 'origin'];
  if (profile.caffeine === 'low') keys.push('low');
  return keys.slice(0, 3).map((key) => {
    const tip = LABEL_TIPS[key];
    return {
      key,
      name: tip.name,
      why: tip.why,
      terms: tip.terms ?? tea.labels.slice(0, 2),
    };
  });
}

export function ritual(profile: Profile): Ritual {
  const tea = TEAS[profile.tea];
  const herbal = profile.family === 'herbal';
  const prepare: RoutineStep[] = [];

  if (profile.tea === 'matcha') {
    prepare.push(
      {
        title: 'Doser',
        detail: 'Environ 2 g de poudre dans un bol, tamisée si possible pour éviter les grumeaux.',
        duration: '20 s',
      },
      {
        title: 'Verser',
        detail: `60 à 80 ml d’eau à ${tea.temperature}, jamais bouillante.`,
        duration: '1 min',
      },
      {
        title: 'Fouetter',
        detail: 'Fouettez en zigzag jusqu’à une fine mousse, sans toucher le fond du bol.',
        duration: tea.infusionShort,
      },
    );
  } else if (profile.serving === 'iced') {
    prepare.push(
      {
        title: 'Doser',
        detail: `8 à 10 g de ${herbal ? 'plantes séchées' : 'feuilles'} pour 1 litre d’eau froide.`,
        duration: '1 min',
      },
      {
        title: 'Infuser au frais',
        detail: 'Laissez infuser au réfrigérateur, dans un récipient fermé.',
        duration: '6 à 12 h',
      },
      {
        title: 'Filtrer et servir',
        detail:
          'Filtrez, servez sur des glaçons et gardez le reste au frais : à boire dans les 24 heures.',
        duration: '1 min',
      },
    );
  } else {
    prepare.push(
      {
        title: 'Chauffer l’eau',
        detail: `Eau à ${tea.temperature}. Une eau peu minéralisée respecte mieux les arômes.`,
        duration: '2 min',
      },
      {
        title: 'Doser',
        detail: herbal
          ? '1 à 2 cuillères à café de plantes séchées pour 20 cl d’eau.'
          : '2 à 3 g de feuilles, soit environ une cuillère à café, pour 20 cl d’eau.',
        duration: '20 s',
      },
    );
    if (profile.tea === 'puerh') {
      prepare.push({
        title: 'Rincer',
        detail: 'Versez de l’eau chaude sur les feuilles et jetez-la aussitôt : un rinçage rapide.',
        duration: '10 s',
      });
    }
    prepare.push({
      title: 'Infuser',
      detail:
        profile.caffeine === 'low'
          ? `${tea.infusion}. Restez sur la durée la plus courte : une infusion brève extrait moins de caféine.`
          : `${tea.infusion}.`,
      duration: tea.infusionShort,
    });
    prepare.push({
      title: 'Retirer',
      detail: herbal
        ? 'Retirez les plantes à l’heure, ou laissez-les un peu pour une tasse plus corsée.'
        : 'Retirez les feuilles ou le sachet à l’heure : une infusion trop longue devient plus amère et plus astringente.',
      duration: '10 s',
    });
    const reinfusable: readonly TeaKey[] = ['green', 'white', 'oolong', 'puerh'];
    if (profile.time === '10' && reinfusable.includes(profile.tea)) {
      prepare.push({
        title: 'Réinfuser',
        detail:
          'Les mêmes feuilles donnent souvent deux ou trois autres infusions, un peu plus longues à chaque fois.',
        duration: '3 min',
      });
    }
  }

  return { prepare, enjoy: enjoy(profile) };
}

function enjoy(profile: Profile): RoutineStep[] {
  const steps: RoutineStep[] = [
    { title: 'Quand', detail: whenDetail(profile), duration: '' },
    { title: 'Avec quoi', detail: withDetail(profile), duration: '' },
    { title: 'Combien', detail: cupsDetail(profile), duration: '' },
  ];
  if (profile.serving !== 'hot') {
    const matcha = profile.tea === 'matcha';
    // En « glacé », la préparation à froid est déjà l’étape principale, sauf pour le matcha.
    if (matcha || profile.serving === 'both') {
      steps.push({
        title: 'Version glacée',
        detail: matcha
          ? 'Fouettez le matcha dans un peu d’eau chaude, puis versez sur des glaçons et complétez d’eau froide.'
          : 'En été, infusez à froid : 8 à 10 g pour 1 litre d’eau, 6 à 12 heures au réfrigérateur, à boire dans les 24 heures.',
        duration: '',
      });
    }
  }
  if (profile.serving !== 'iced') {
    steps.push({
      title: 'Pas trop chaud',
      detail:
        'Laissez la tasse refroidir quelques minutes : le CIRC classe les boissons bues très chaudes (au-delà de 65 °C) comme « probablement cancérogènes » (cancer de l’œsophage).',
      duration: '',
    });
  }
  return steps;
}

function whenDetail(profile: Profile): string {
  if (profile.family === 'herbal') {
    return 'Sans caféine, cette tasse se boit à toute heure, y compris le soir.';
  }
  switch (profile.moment) {
    case 'morning':
      return 'Le matin, pour démarrer la journée.';
    case 'afternoon':
      return 'En début d’après-midi : la caféine met plusieurs heures à s’éliminer, mieux vaut ne pas repousser la tasse trop tard.';
    case 'meal':
      return 'Après le repas plutôt que pendant : le thé pris pendant un repas peut réduire l’absorption du fer d’origine végétale.';
    case 'evening':
      return 'Vous la buvez le soir : la caféine peut retarder l’endormissement chez certaines personnes. Si c’est votre cas, avancez la tasse.';
  }
}

function withDetail(profile: Profile): string {
  const { milk, tea } = profile;
  if (milk === 'milk') {
    if (tea === 'black' || tea === 'chai' || tea === 'rooibos') {
      return 'Un nuage de lait adoucit l’astringence et s’accorde bien avec cette tasse.';
    }
    return 'Le lait masquerait la finesse de cette tasse : goûtez-la d’abord nature, puis ajoutez-en si vous y tenez.';
  }
  if (milk === 'sweet') {
    return 'Ajoutez le sucre ou le miel en petite quantité, après avoir goûté la tasse nature.';
  }
  return 'Nature, pour goûter la feuille ou la plante telle qu’elle est.';
}

function cupsDetail(profile: Profile): string {
  const caffeinated = profile.caffeine !== 'none';
  switch (profile.cups) {
    case '1':
      return 'Une tasse par jour : un bon rythme pour comparer plusieurs thés au fil de la semaine.';
    case 'few':
      return caffeinated
        ? 'Deux ou trois tasses : alternez avec de l’eau et une infusion si vous voulez limiter la caféine.'
        : 'Deux ou trois tasses : pensez à boire aussi de l’eau entre elles.';
    case 'many':
      return caffeinated
        ? 'Quatre tasses ou plus : alternez avec des infusions et de l’eau, surtout l’après-midi, si vous voulez limiter la caféine.'
        : 'Quatre tasses ou plus : pensez à boire aussi de l’eau entre elles.';
  }
}

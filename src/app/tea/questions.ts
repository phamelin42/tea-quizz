export interface QuizOption {
  readonly label: string;
  readonly value: string;
}

export interface QuizQuestion {
  readonly id: QuestionId;
  readonly text: string;
  readonly hint: string;
  readonly options: readonly QuizOption[];
}

export type QuestionId =
  | 'moment'
  | 'need'
  | 'caffeine'
  | 'taste'
  | 'milk'
  | 'bitter'
  | 'experience'
  | 'time'
  | 'serving'
  | 'cups';

export const QUESTIONS: readonly QuizQuestion[] = [
  {
    id: 'moment',
    text: 'À quel moment de la journée prendrez-vous cette tasse ?',
    hint: 'Choisissez le moment où vous la boirez le plus souvent.',
    options: [
      { label: 'Le matin', value: 'morning' },
      { label: 'En début d’après-midi', value: 'afternoon' },
      { label: 'Après le repas', value: 'meal' },
      { label: 'Le soir', value: 'evening' },
    ],
  },
  {
    id: 'need',
    text: 'Qu’attendez-vous d’abord de cette tasse ?',
    hint: 'Un seul choix, celui qui compte le plus aujourd’hui.',
    options: [
      { label: 'Me réveiller', value: 'wake' },
      { label: 'Me concentrer', value: 'focus' },
      { label: 'Me détendre', value: 'relax' },
      { label: 'Me faire plaisir', value: 'pleasure' },
      { label: 'Me réchauffer, me réconforter', value: 'comfort' },
    ],
  },
  {
    id: 'caffeine',
    text: 'Que pensez-vous de la caféine ?',
    hint: 'La théine du thé est la même molécule que la caféine.',
    options: [
      { label: 'Je la recherche', value: 'love' },
      { label: 'Un peu, sans excès', value: 'some' },
      { label: 'Le moins possible', value: 'little' },
      { label: 'Aucune', value: 'none' },
    ],
  },
  {
    id: 'taste',
    text: 'Quelles saveurs vous attirent le plus ?',
    hint: 'Pensez à ce que vous aimez ailleurs : en cuisine, en dessert, en parfum.',
    options: [
      { label: 'Végétales, comme de l’herbe fraîche', value: 'vegetal' },
      { label: 'Florales et délicates', value: 'floral' },
      { label: 'Boisées, maltées ou torréfiées', value: 'woody' },
      { label: 'Douces et miellées', value: 'sweet' },
      { label: 'Épicées et réchauffantes', value: 'spicy' },
      { label: 'Fraîches et mentholées', value: 'fresh' },
      { label: 'Fruitées et acidulées', value: 'fruity' },
    ],
  },
  {
    id: 'milk',
    text: 'Comment buvez-vous votre boisson chaude ?',
    hint: '',
    options: [
      { label: 'Nature, sans rien', value: 'plain' },
      { label: 'Avec un nuage de lait', value: 'milk' },
      { label: 'Avec un peu de sucre ou de miel', value: 'sweet' },
    ],
  },
  {
    id: 'bitter',
    text: 'Et l’amertume ?',
    hint: 'Une pointe d’amertume et d’astringence, cette sensation sèche en bouche, est normale dans un thé.',
    options: [
      { label: 'Je la fuis', value: 'dislike' },
      { label: 'Un peu, ça me va', value: 'ok' },
      { label: 'Je l’apprécie', value: 'like' },
    ],
  },
  {
    id: 'experience',
    text: 'Où en êtes-vous avec le thé ?',
    hint: '',
    options: [
      { label: 'Je débute', value: 'new' },
      { label: 'Je bois surtout du thé en sachet', value: 'bags' },
      { label: 'J’utilise déjà des feuilles entières', value: 'leaves' },
      { label: 'Je suis un amateur averti', value: 'expert' },
    ],
  },
  {
    id: 'time',
    text: 'Combien de temps accordez-vous à votre tasse, de l’eau chaude à la première gorgée ?',
    hint: 'Une tasse bue vaut mieux qu’un rituel parfait.',
    options: [
      { label: 'Moins de 3 minutes', value: '3' },
      { label: 'Environ 5 minutes', value: '5' },
      { label: '10 minutes ou plus', value: '10' },
    ],
  },
  {
    id: 'serving',
    text: 'Chaud ou glacé ?',
    hint: '',
    options: [
      { label: 'Chaud', value: 'hot' },
      { label: 'Glacé', value: 'iced' },
      { label: 'Les deux, selon la saison', value: 'both' },
    ],
  },
  {
    id: 'cups',
    text: 'Combien de tasses de thé ou d’infusion buvez-vous par jour ?',
    hint: 'À peu près, en tout.',
    options: [
      { label: 'Une', value: '1' },
      { label: 'Deux ou trois', value: 'few' },
      { label: 'Quatre ou plus', value: 'many' },
    ],
  },
];

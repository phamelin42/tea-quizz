import { FAMILIES, GEARS, LABEL_TIPS, START_ADVICE, TEAS, type TeaKey } from './content';
import { analyse, type Answers, gearFor, labelHints, ritual, teas } from './profile';
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

/** Toutes les combinaisons de réponses possibles. */
function* everyAnswers(index = 0, prefix: number[] = []): Generator<Answers> {
  if (index === QUESTIONS.length) {
    yield prefix;
    return;
  }
  for (let option = 0; option < QUESTIONS[index].options.length; option++) {
    yield* everyAnswers(index + 1, [...prefix, option]);
  }
}

const HERBALS: readonly TeaKey[] = ['rooibos', 'chamomile', 'mint', 'verbena', 'fruit'];

describe('contenu', () => {
  it('range chaque thé dans la bonne famille, avec ou sans caféine', () => {
    for (const [key, tea] of Object.entries(TEAS)) {
      const herbal = HERBALS.includes(key as TeaKey);
      expect(tea.family === 'herbal', key).toBe(herbal);
      expect(tea.caffeine, key).toBe(!herbal);
      expect(tea.labels.length, key).toBeGreaterThan(0);
      expect(FAMILIES[tea.family], key).toBeDefined();
    }
  });
});

describe('analyse', () => {
  it('écarte toute caféine quand on répond « Aucune », à toute heure', () => {
    for (const moment of ['morning', 'afternoon', 'meal', 'evening']) {
      const profile = analyse(answers({ moment, caffeine: 'none' }));
      expect(profile.caffeine).toBe('none');
      expect(profile.caffeineRefused).toBe(true);
      expect(profile.family).toBe('herbal');
    }
  });

  it('ne propose pas de caféine le soir à qui veut la limiter, mais la garde à qui la recherche', () => {
    for (const caffeine of ['some', 'little']) {
      const profile = analyse(answers({ moment: 'evening', caffeine }));
      expect(profile.caffeine, caffeine).toBe('none');
      expect(profile.caffeineRefused, caffeine).toBe(false);
    }
    expect(analyse(answers({ moment: 'evening', caffeine: 'love' })).caffeine).toBe('regular');
    expect(analyse(answers({ moment: 'morning', caffeine: 'little' })).caffeine).toBe('low');
    expect(analyse(answers({ moment: 'morning', caffeine: 'some' })).caffeine).toBe('regular');
  });

  it('choisit l’infusion selon la saveur quand il n’y a pas de caféine', () => {
    const expected = {
      vegetal: 'verbena',
      floral: 'chamomile',
      woody: 'rooibos',
      sweet: 'rooibos',
      spicy: 'rooibos',
      fresh: 'mint',
      fruity: 'fruit',
    };
    for (const [taste, tea] of Object.entries(expected)) {
      expect(analyse(answers({ caffeine: 'none', taste })).tea, taste).toBe(tea);
    }
  });

  it('propose un thé noir ou un chai à qui veut se réveiller ou se réconforter avec du lait', () => {
    const base = { caffeine: 'love', milk: 'milk' };
    expect(analyse(answers({ ...base, need: 'wake', taste: 'woody' })).tea).toBe('black');
    expect(analyse(answers({ ...base, need: 'comfort', taste: 'spicy' })).tea).toBe('chai');
  });

  it('propose un thé vert ou un matcha pour se concentrer avec des saveurs végétales', () => {
    const base = { need: 'focus', taste: 'vegetal', caffeine: 'love', milk: 'plain' };
    expect(analyse(answers({ ...base, experience: 'new', bitter: 'dislike' })).tea).toBe('green');
    expect(
      analyse(answers({ ...base, experience: 'expert', bitter: 'like', time: '10' })).tea,
    ).toBe('matcha');
  });

  it('propose un thé blanc pour une tasse florale, douce et peu amère', () => {
    const profile = analyse(
      answers({
        need: 'relax',
        taste: 'floral',
        bitter: 'dislike',
        milk: 'plain',
        caffeine: 'some',
      }),
    );
    expect(profile.tea).toBe('white');
    expect(profile.family).toBe('delicate');
  });

  it('propose un pu-erh pour un goût boisé après le repas, avec du temps', () => {
    const profile = analyse(
      answers({
        moment: 'meal',
        taste: 'woody',
        need: 'pleasure',
        experience: 'expert',
        time: '10',
        milk: 'plain',
        bitter: 'like',
      }),
    );
    expect(profile.tea).toBe('puerh');
    expect(profile.family).toBe('deep');
  });

  it('ajoute une infusion pour limiter la caféine, le soir, au-delà de trois tasses ou pour se détendre', () => {
    const complement = (values: Partial<Record<QuestionId, string>>) =>
      analyse(answers({ moment: 'morning', caffeine: 'love', need: 'wake', cups: '1', ...values }))
        .complement;
    expect(complement({})).toBeNull();
    expect(complement({ caffeine: 'little' })).not.toBeNull();
    expect(complement({ cups: 'many' })).not.toBeNull();
    expect(complement({ need: 'relax' })).not.toBeNull();
    expect(complement({ moment: 'evening' })).not.toBeNull();
    // Une infusion n’a pas besoin d’une autre infusion.
    expect(analyse(answers({ caffeine: 'none' })).complement).toBeNull();
  });

  it('propose un autre thé d’une autre famille pour varier', () => {
    const profile = analyse(answers({ need: 'wake', taste: 'woody', caffeine: 'love' }));
    expect(TEAS[profile.alternative].family).not.toBe(profile.family);
  });
});

describe('matériel', () => {
  it('choisit le fouet, la carafe, le gaiwan ou l’infuseur', () => {
    const gear = (values: Partial<Record<QuestionId, string>>) =>
      gearFor(analyse(answers({ caffeine: 'love', ...values })));
    const matcha = { need: 'focus', taste: 'vegetal', experience: 'expert', bitter: 'like' };
    expect(gear({ ...matcha, time: '10', serving: 'hot' })).toBe('whisk');
    expect(gear({ need: 'wake', taste: 'woody', serving: 'iced' })).toBe('carafe');
    const slow = { need: 'relax', taste: 'floral', milk: 'plain', time: '10', serving: 'hot' };
    expect(gear(slow)).toBe('gaiwan');
    expect(gear({ ...slow, time: '3' })).toBe('infuser');
    expect(gear({ need: 'wake', taste: 'woody', milk: 'milk', time: '10' })).toBe('infuser');
  });
});

describe('thés et rituel', () => {
  const steps = (values: Partial<Record<QuestionId, string>>) =>
    ritual(analyse(answers({ caffeine: 'love', ...values })));
  const titles = (list: readonly { title: string }[]) => list.map((step) => step.title);

  it('prépare un matcha au fouet, même glacé', () => {
    const matcha = { ...analyse(answers({ serving: 'iced' })), tea: 'matcha' as const };
    const { prepare, enjoy } = ritual(matcha);
    expect(titles(prepare)).toEqual(['Doser', 'Verser', 'Fouetter']);
    expect(titles(enjoy)).toContain('Version glacée');
  });

  it('infuse à froid, au réfrigérateur, un thé glacé', () => {
    const { prepare, enjoy } = steps({ need: 'wake', taste: 'woody', serving: 'iced' });
    expect(titles(prepare)).toEqual(['Doser', 'Infuser au frais', 'Filtrer et servir']);
    expect(prepare[2].detail).toContain('24 heures');
    expect(titles(enjoy)).not.toContain('Pas trop chaud');
  });

  it('propose la version glacée en plus du chaud pour « les deux »', () => {
    const { prepare, enjoy } = steps({ need: 'wake', taste: 'woody', serving: 'both' });
    expect(titles(prepare)).toContain('Chauffer l’eau');
    expect(titles(enjoy)).toEqual(expect.arrayContaining(['Version glacée', 'Pas trop chaud']));
  });

  it('rince un pu-erh et réinfuse les feuilles quand on a dix minutes', () => {
    const puerh = { moment: 'meal', taste: 'woody', need: 'pleasure', experience: 'expert' };
    const base = { ...puerh, bitter: 'like', milk: 'plain', serving: 'hot' };
    expect(titles(steps({ ...base, time: '10' }).prepare)).toEqual([
      'Chauffer l’eau',
      'Doser',
      'Rincer',
      'Infuser',
      'Retirer',
      'Réinfuser',
    ]);
    expect(titles(steps({ ...base, time: '5' }).prepare)).not.toContain('Réinfuser');
  });

  it('demande l’infusion la plus courte à qui veut limiter la caféine', () => {
    const infuse = (caffeine: string) =>
      steps({ moment: 'morning', caffeine, serving: 'hot' }).prepare.find(
        (step) => step.title === 'Infuser',
      )!;
    expect(infuse('little').detail).toContain('moins de caféine');
    expect(infuse('love').detail).not.toContain('caféine');
  });

  it('donne l’eau à la bonne température pour chaque thé', () => {
    const water = (values: Partial<Record<QuestionId, string>>) =>
      steps({ serving: 'hot', ...values }).prepare[0].detail;
    expect(water({ need: 'wake', taste: 'woody', milk: 'milk' })).toContain('95 à 100');
    expect(water({ need: 'focus', taste: 'vegetal', bitter: 'dislike' })).toContain('70 à 80');
    expect(water({ caffeine: 'none', taste: 'floral' })).toContain('100');
  });

  it('dit de ne pas mettre de lait dans une tasse fine, et de goûter nature d’abord', () => {
    const detail = (values: Partial<Record<QuestionId, string>>) =>
      steps({ ...values }).enjoy.find((step) => step.title === 'Avec quoi')!.detail;
    expect(detail({ need: 'wake', taste: 'woody', milk: 'milk' })).toContain('adoucit');
    expect(detail({ need: 'relax', taste: 'floral', milk: 'plain' })).toContain('Nature');
    expect(
      detail({
        need: 'focus',
        taste: 'vegetal',
        bitter: 'like',
        milk: 'milk',
        experience: 'expert',
      }),
    ).toContain('masquerait');
  });

  it('place le thé, le thé suivant, l’infusion éventuelle puis le matériel', () => {
    const cards = teas(analyse(answers({ caffeine: 'little', need: 'wake', taste: 'woody' })));
    expect(cards.map((card) => card.key)).toEqual(['main', 'alternative', 'complement', 'gear']);
    expect(cards[0].when).toBe('Le matin');
  });

  it('donne un résultat complet, cohérent et sans promesse pour toutes les réponses possibles', () => {
    // Des centaines de milliers de combinaisons : on relève les défauts, puis un seul expect.
    const defects: string[] = [];
    const texts = new Set<string>();
    let count = 0;
    for (const combination of everyAnswers()) {
      const profile = analyse(combination);
      const cards = teas(profile);
      const hints = labelHints(profile);
      const { prepare, enjoy } = ritual(profile);
      const withCaffeine = TEAS[profile.tea].caffeine;
      const unique = (list: readonly string[]) => new Set(list).size === list.length;
      const ok =
        TEAS[profile.tea].family === profile.family &&
        profile.alternative !== profile.tea &&
        TEAS[profile.alternative].caffeine === withCaffeine &&
        // Pas de caféine demandée, pas de caféine servie.
        (profile.caffeine === 'none') === !withCaffeine &&
        (profile.complement === null || HERBALS.includes(profile.complement)) &&
        (!profile.complement || withCaffeine) &&
        cards.length >= 3 &&
        cards.length <= 4 &&
        unique(cards.map((card) => card.key)) &&
        hints.length >= 2 &&
        hints.length <= 3 &&
        unique(hints.map((hint) => hint.key)) &&
        hints.every((hint) => hint.terms.length > 0) &&
        prepare.length >= 3 &&
        enjoy.length >= 3 &&
        unique(prepare.map((step) => step.title)) &&
        unique(enjoy.map((step) => step.title)) &&
        [...prepare, ...enjoy].every(
          (step) => step.title && step.detail && !/undefined|null/.test(step.detail),
        );
      if (!ok && defects.length < 5) defects.push(combination.join(','));
      for (const step of [...prepare, ...enjoy]) texts.add(step.detail);
      for (const card of cards) texts.add(card.text);
      for (const hint of hints) texts.add(hint.why);
      count++;
    }
    expect(defects).toEqual([]);
    expect(count).toBe(QUESTIONS.reduce((total, q) => total * q.options.length, 1));

    // Aucune promesse de résultat, aucun vocabulaire médical : texte relu en entier.
    const everyText = [
      ...texts,
      ...Object.values(TEAS).flatMap((tea) => [tea.why, tea.flavour, tea.note ?? '']),
      ...Object.values(FAMILIES).map((family) => family.text),
      ...Object.values(GEARS).map((gear) => gear.text),
      ...Object.values(LABEL_TIPS).map((tip) => tip.why),
      ...Object.values(START_ADVICE),
    ];
    const promises = everyText.filter((text) =>
      /guéri|soign|détox|minceur|maigr|brûle|prévient|immun|anticancér|vertu|miracle|bienfait/i.test(
        text,
      ),
    );
    expect(promises).toEqual([]);
  }, 120_000);
});

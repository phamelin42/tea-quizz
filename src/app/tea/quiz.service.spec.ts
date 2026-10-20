import { TestBed } from '@angular/core/testing';
import { PRODUCT_CATALOGUE } from './products';
import { FIXTURE_CATALOGUE } from './products.fixture';
import { QUESTIONS } from './questions';
import { ANALYSIS_DELAY, ANSWER_DELAY, QuizService } from './quiz.service';

describe('QuizService', () => {
  let quiz: QuizService;

  beforeEach(() => {
    vi.useFakeTimers();
    quiz = TestBed.inject(QuizService);
  });

  afterEach(() => vi.useRealTimers());

  function answerAll(option = 0): void {
    QUESTIONS.forEach(() => {
      quiz.choose(option);
      vi.advanceTimersByTime(ANSWER_DELAY);
    });
  }

  it('commence par l’accueil, puis la première question', () => {
    expect(quiz.screen()).toBe('home');
    quiz.start();
    expect(quiz.screen()).toBe('quiz');
    expect(quiz.question()).toBe(QUESTIONS[0]);
    expect(quiz.progress()).toBe(0);
  });

  it('coche la réponse, puis passe à la question suivante après un court instant', () => {
    quiz.start();
    quiz.choose(2);
    expect(quiz.selected()).toBe(2);
    expect(quiz.index()).toBe(0);
    vi.advanceTimersByTime(ANSWER_DELAY);
    expect(quiz.index()).toBe(1);
    expect(quiz.progress()).toBe(10);
  });

  it('ignore un second choix pendant la transition et une option inexistante', () => {
    quiz.start();
    quiz.choose(9);
    expect(quiz.selected()).toBeNull();
    quiz.choose(0);
    quiz.choose(1);
    expect(quiz.selected()).toBe(0);
    vi.advanceTimersByTime(ANSWER_DELAY);
    expect(quiz.index()).toBe(1);
  });

  it('revient à la question précédente en annulant la transition en cours', () => {
    quiz.start();
    quiz.choose(0);
    vi.advanceTimersByTime(ANSWER_DELAY);
    quiz.choose(1);
    quiz.back();
    vi.advanceTimersByTime(ANSWER_DELAY);
    expect(quiz.index()).toBe(0);
    expect(quiz.selected()).toBe(0);
  });

  it('analyse les réponses puis affiche le résultat', () => {
    quiz.start();
    answerAll();
    expect(quiz.screen()).toBe('analysis');
    expect(quiz.result()).toBeNull();
    vi.advanceTimersByTime(ANALYSIS_DELAY);
    expect(quiz.screen()).toBe('result');
    // Première option partout : le matin, se réveiller, la caféine recherchée.
    expect(quiz.result()?.profile.tea).toBe('black');
  });

  it('garde les réponses pour les modifier, les efface pour recommencer', () => {
    quiz.start();
    answerAll(1);
    vi.advanceTimersByTime(ANALYSIS_DELAY);

    quiz.edit();
    expect(quiz.screen()).toBe('quiz');
    expect(quiz.index()).toBe(0);
    expect(quiz.selected()).toBe(1);

    quiz.restart();
    expect(quiz.screen()).toBe('home');
    expect(quiz.answers().every((answer) => answer === null)).toBe(true);
  });

  it('n’affiche pas de résultat qui arriverait après un retour à l’accueil', () => {
    quiz.start();
    answerAll();
    quiz.restart();
    vi.advanceTimersByTime(ANALYSIS_DELAY);
    expect(quiz.screen()).toBe('home');
  });
});

describe('QuizService : exemples de produits', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function resultOf(quiz: QuizService) {
    quiz.start();
    QUESTIONS.forEach(() => {
      quiz.choose(0);
      vi.advanceTimersByTime(ANSWER_DELAY);
    });
    vi.advanceTimersByTime(ANALYSIS_DELAY);
    return quiz.result()!;
  }

  it('n’attache aucun exemple tant que le catalogue est vide', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PRODUCT_CATALOGUE, useValue: [] }] });
    const { teas } = resultOf(TestBed.inject(QuizService));
    expect(teas.length).toBeGreaterThan(0);
    expect(teas.every((card) => card.examples.length === 0)).toBe(true);
  });

  it('attache à chaque carte de thé les produits de son type, et rien au matériel', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PRODUCT_CATALOGUE, useValue: FIXTURE_CATALOGUE }],
    });
    const { profile, teas } = resultOf(TestBed.inject(QuizService));
    const main = teas.find((card) => card.key === 'main')!;
    const gear = teas.find((card) => card.key === 'gear')!;
    expect(main.examples.length).toBeGreaterThan(0);
    expect(main.examples.every((item) => item.tea === profile.tea)).toBe(true);
    expect(gear.examples).toEqual([]);
  });
});

import { TestBed } from '@angular/core/testing';
import { QUESTIONS } from '../tea/questions';
import { PRODUCT_CATALOGUE } from '../tea/products';
import { FIXTURE_CATALOGUE } from '../tea/products.fixture';
import { ANALYSIS_DELAY, ANSWER_DELAY, QuizService } from '../tea/quiz.service';
import { Result } from './result';

describe('Result', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function render(catalogue?: typeof FIXTURE_CATALOGUE) {
    if (catalogue) {
      TestBed.configureTestingModule({
        providers: [{ provide: PRODUCT_CATALOGUE, useValue: catalogue }],
      });
    }
    const quiz = TestBed.inject(QuizService);
    quiz.start();
    QUESTIONS.forEach(() => {
      quiz.choose(0);
      vi.advanceTimersByTime(ANSWER_DELAY);
    });
    vi.advanceTimersByTime(ANALYSIS_DELAY);
    expect(quiz.screen()).toBe('result');
    const fixture = TestBed.createComponent(Result);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  const occurrences = (text: string, part: string) => text.split(part).length - 1;

  it('n’affiche ni exemples ni mention d’affiliation tant que le catalogue est vide', async () => {
    const element = await render();
    expect(element.querySelector('app-examples')).toBeNull();
    expect(element.textContent).not.toContain('Partenaire Amazon');
    expect(element.textContent).not.toContain('Exemples sur Amazon');
  });

  it('affiche les exemples dans la carte du thé, avec la mention d’affiliation une seule fois', async () => {
    const element = await render(FIXTURE_CATALOGUE);
    const blocks = element.querySelectorAll('app-examples');
    // Le thé principal et l’alternative ont chacun un exemple ; le matériel n’en a pas.
    expect(blocks).toHaveLength(2);
    for (const block of blocks) expect(block.closest('article')).not.toBeNull();
    const text = element.textContent!.replace(/\s+/g, ' ');
    expect(occurrences(text, 'Partenaire Amazon')).toBe(1);
    expect(occurrences(text, 'présentés sans classement')).toBe(1);
  });

  it('garde l’encart « Ceci n’est pas un avis médical »', async () => {
    const element = await render(FIXTURE_CATALOGUE);
    expect(element.querySelector('fd-alert')?.textContent).toContain(
      'Ceci n’est pas un avis médical',
    );
  });
});

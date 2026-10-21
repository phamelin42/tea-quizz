import { TestBed } from '@angular/core/testing';
import { QUESTIONS } from '../tea/questions';
import { CATALOGUE, PRODUCT_CATALOGUE, PRODUCT_GEAR_CATALOGUE } from '../tea/products';
import { FIXTURE_CATALOGUE, FIXTURE_GEAR_CATALOGUE } from '../tea/products.fixture';
import { ANALYSIS_DELAY, ANSWER_DELAY, QuizService } from '../tea/quiz.service';
import { Result } from './result';

describe('Result', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  /** Le catalogue est toujours fourni : le test ne dépend pas de ce que contient `CATALOGUE`. */
  async function render(
    catalogue: typeof FIXTURE_CATALOGUE = [],
    gear: typeof FIXTURE_GEAR_CATALOGUE = [],
  ) {
    TestBed.configureTestingModule({
      providers: [
        { provide: PRODUCT_CATALOGUE, useValue: catalogue },
        { provide: PRODUCT_GEAR_CATALOGUE, useValue: gear },
      ],
    });
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

  it('n’affiche aucun exemple tant que le catalogue est vide', async () => {
    const element = await render();
    expect(element.querySelector('app-examples')).toBeNull();
    expect(element.textContent).not.toContain('Exemples sur Amazon');
  });

  it('affiche les exemples dans la carte du thé, sans mention d’affiliation (décision de Phil du 21/10/2026)', async () => {
    const element = await render(FIXTURE_CATALOGUE);
    const blocks = element.querySelectorAll('app-examples');
    // Le thé principal et l’alternative ont chacun un exemple ; le matériel n’en a pas.
    expect(blocks).toHaveLength(2);
    for (const block of blocks) expect(block.closest('article')).not.toBeNull();
    const text = element.textContent!.replace(/\s+/g, ' ');
    expect(text).not.toContain('Partenaire Amazon');
    expect(text).not.toContain('sans classement');
  });

  it('affiche les accessoires dans la carte du matériel', async () => {
    const element = await render([], FIXTURE_GEAR_CATALOGUE);
    const blocks = element.querySelectorAll('app-examples');
    expect(blocks).toHaveLength(1);
    expect(blocks[0].closest('article')?.querySelector('[slot="title"]')?.textContent).toMatch(
      /infuseur|fouet|carafe|théière|gaiwan/i,
    );
    expect(blocks[0].textContent).toContain('Caractéristiques');
  });

  it('garde l’encart « Ceci n’est pas un avis médical »', async () => {
    const element = await render(FIXTURE_CATALOGUE);
    expect(element.querySelector('fd-alert')?.textContent).toContain(
      'Ceci n’est pas un avis médical',
    );
  });

  it('mentionne la réglisse dans l’encart, avec le conseil de demander un avis', async () => {
    const element = await render();
    const box = element.querySelector('fd-alert')!.textContent!.replace(/[^\S\u00a0]+/g, ' ');
    expect(box).toContain(
      'La réglisse, présente dans certaines infusions, peut faire monter la tension artérielle\u00a0: en cas d’hypertension ou de grossesse, demandez conseil à un médecin ou à un pharmacien.',
    );
    // Les phrases d'origine restent.
    expect(box).toContain('La caféine peut perturber le sommeil');
    expect(box).toContain('absorption du fer');
  });

  it('prévient de la réglisse dès qu’un produit du catalogue en contient', async () => {
    const licorice = CATALOGUE.filter((item) =>
      item.ingredients.some((ingredient) => /r[ée]glisse|licorice|liquorice/i.test(ingredient)),
    );
    // Avec ces produits à l'écran ou non, l'encart prévient : le catalogue ne l'emporte pas sur lui.
    for (const catalogue of [CATALOGUE, licorice]) {
      const element = await render(catalogue);
      expect(element.querySelector('fd-alert')!.textContent).toContain('réglisse');
      TestBed.resetTestingModule();
    }
  });
});

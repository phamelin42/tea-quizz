import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FdAlert, FdBadge, FdButton, FdCard } from '@phamelin/fuda';
import { Examples } from '../examples/examples';
import { FAMILIES, MOMENT_LABELS, SERVING_LABELS, START_ADVICE } from '../tea/content';
import { AFFILIATE_NOTICE, EXAMPLES_NOTE } from '../tea/products';
import { QuizService } from '../tea/quiz.service';

const MINUTES = { '3': 'moins de 3 minutes', '5': 'environ 5 minutes', '10': '10 minutes ou plus' };
const CAFFEINE_LABELS = {
  none: 'Sans caféine',
  low: 'Caféine à limiter',
  regular: 'Avec caféine',
} as const;

@Component({
  selector: 'app-result',
  imports: [Examples, FdAlert, FdBadge, FdButton, FdCard],
  templateUrl: './result.html',
  styleUrl: './result.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'app-result' },
})
export class Result {
  protected readonly quiz = inject(QuizService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');

  protected readonly view = computed(() => {
    const result = this.quiz.result();
    if (!result) return null;
    const { profile } = result;
    return {
      ...result,
      family: FAMILIES[profile.family],
      caffeineLabel: CAFFEINE_LABELS[profile.caffeine],
      momentLabel: MOMENT_LABELS[profile.moment],
      servingLabel: SERVING_LABELS[profile.serving],
      minutes: MINUTES[profile.time],
      advice: START_ADVICE[profile.experience],
      // La mention accompagne les liens : sans exemple affiché, elle n’a pas lieu d’être.
      affiliate: result.teas.some((card) => card.examples.length > 0),
      notice: AFFILIATE_NOTICE,
      note: EXAMPLES_NOTE,
    };
  });

  constructor() {
    afterNextRender(() => this.heading()?.nativeElement.focus({ preventScroll: true }));
  }
}

import { Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { FdSwitch, FdThemeService } from '@phamelin/fuda';

@Component({
  selector: 'app-root',
  imports: [FdSwitch],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'app' },
})
export class App {
  private readonly themeService = inject(FdThemeService);

  protected readonly title = 'Tea Quizz';
  protected readonly tagline = "Quels sont les bienfaits de chaque thé ?";
  protected readonly isDark = computed(() => this.themeService.theme() === 'dark');

  protected setDark(dark: boolean): void {
    this.themeService.set(dark ? 'dark' : 'light');
  }
}

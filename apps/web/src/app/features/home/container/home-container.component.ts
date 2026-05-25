import { Component, inject } from '@angular/core';
import { HomeFacade } from '../home.facade';
import { HomeState } from '../state/home.state';
import { HeroSectionComponent } from '../components/hero-section/hero-section.component';

@Component({
  selector: 'app-home-container',
  standalone: true,
  templateUrl: './home-container.component.html',
  imports: [HeroSectionComponent],
  providers: [HomeFacade, HomeState],
})
export class HomeContainerComponent {
  protected readonly facade = inject(HomeFacade);
}

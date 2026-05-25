import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden-container',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './forbidden-container.component.html',
})
export class ForbiddenContainerComponent {}

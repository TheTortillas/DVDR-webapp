import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { LoadingService } from './core/services/loading.service';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from './shared/components/loading/loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    CommonModule,
    LoadingComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewChecked, OnInit {
  title = 'Frontend';

  constructor(
    public loadingService: LoadingService,
    private cdr: ChangeDetectorRef,
    private router: Router // Inyección del Router
  ) {}

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  ngOnInit() {
    // Escucha el evento NavigationEnd y resetea el scroll al inicio
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0); // Coloca el scroll en la parte superior
      }
    });
  }
}

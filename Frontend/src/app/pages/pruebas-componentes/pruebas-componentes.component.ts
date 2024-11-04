import { AfterViewInit, Component, ViewChild, inject, DestroyRef } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { delay, filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-pruebas-componentes',
  standalone: true,
  templateUrl: './pruebas-componentes.component.html',
  styleUrl: './pruebas-componentes.component.scss',
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
  ],
})
export class PruebasComponentesComponent implements AfterViewInit {
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  private observer = inject(BreakpointObserver);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  ngAfterViewInit() {
    this.observer
      .observe(['(max-width: 800px)'])
      .pipe(
        delay(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res: BreakpointState) => {
        if (res.matches) {
          this.sidenav.mode = 'over';
          this.sidenav.close();
        } else {
          this.sidenav.mode = 'side';
          this.sidenav.open();
        }
      });

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        if (this.sidenav.mode === 'over') {
          this.sidenav.close();
        }
      });
  }
}
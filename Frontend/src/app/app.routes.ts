import { Routes } from '@angular/router';
import { HomeComponent } from './pages/landing/home/home.component';
import { PageNotFoundComponent } from './pages/landing/page-not-found/page-not-found.component';
import { LoginPageComponent } from './pages/auth/login-page/login-page.component';
import { ContactUsPageComponent } from './pages/landing/contact-us-page/contact-us-page.component';
import { CourseRegisterComponent } from './pages/profile/course-register/course-register.component';
import { PruebasComponentesComponent } from './pages/pruebas-componentes/pruebas-componentes.component';
import { InstructorRegisterComponent } from './pages/profile/instructor-register/instructor-register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthComponent } from './pages/auth/auth.component';
import { RequestApertureComponent } from './pages/profile/request-aperture/request-aperture.component';
import { MyCoursesComponent } from './pages/profile/my-courses/my-courses.component';
import { ApertureInfoComponent } from './pages/profile/request-aperture/aperture-info/aperture-info.component';
export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },

  {
    path: 'login',
    component: LoginPageComponent,
  },

  {
    path: 'contact-us',
    component: ContactUsPageComponent,
  },

  {
    path: 'pruebas-componentes',
    component: PruebasComponentesComponent,
  },

  {
    path: 'auth',
    component: AuthComponent,
    children: [
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full',
      },

      {
        path: 'instructor-register',
        component: InstructorRegisterComponent,
      },

      {
        path: 'profile',
        component: ProfileComponent,
      },

      {
        path: 'course-register',
        component: CourseRegisterComponent,
      },

      {
        path: 'request-aperture',
        component: RequestApertureComponent,
        children: [
          {
            path: '',
            redirectTo: 'request-aperture',
            pathMatch: 'full',
          },

          {
            path: 'aperture-info',
            component: ApertureInfoComponent,
          },
        ],
      },

      {
        path: 'my-courses',
        component: MyCoursesComponent,
      },
    ],
    //guards
  },

  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  {
    path: '**',
    component: PageNotFoundComponent,
  },
];

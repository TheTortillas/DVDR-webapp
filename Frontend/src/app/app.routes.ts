import { Routes } from '@angular/router';
import { HomeComponent } from './pages/landing/home/home.component';
import { PageNotFoundComponent } from './pages/landing/page-not-found/page-not-found.component';
import { LoginPageComponent } from './pages/auth/login-page/login-page.component';
import { ContactUsPageComponent } from './pages/landing/contact-us-page/contact-us-page.component';
import { CourseRegisterComponent } from './pages/profile/course-register/course-register.component';
import { PruebasComponentesComponent } from './pages/pruebas-componentes/pruebas-componentes.component';
import { InstructorRegisterComponent } from './shared/components/instructor-register/instructor-register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthComponent } from './pages/auth/auth.component';
import { RequestApertureComponent } from './pages/profile/request-aperture/request-aperture.component';
import { MyCoursesComponent } from './pages/profile/my-courses/my-courses.component';
import { ApertureInfoComponent } from './pages/profile/aperture-info/aperture-info.component';
import { DashboardComponent } from './pages/profile/dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { InstructorsCatalogComponent } from './pages/profile/instructors-catalog/instructors-catalog.component';
import { PruebasFicherosComponent } from './pages/pruebas-ficheros/pruebas-ficheros.component';
import { RequestCertificatesComponent } from './pages/profile/request-certificates/request-certificates.component';
import { ManagementComponent } from './pages/management/management.component';
import { ManagementDashboardComponent } from './pages/management/dashboard/dashboard.component';
import { AllCoursesComponent } from './pages/management/all-courses/all-courses.component';
import { CourseRegisterRequestComponent } from './pages/management/course-register-request/course-register-request.component';
import { CertificateRequestsComponent } from './pages/management/certificate-requests/certificate-requests.component';
import { CentersComponent } from './pages/management/centers/centers.component';
import { DiploemaRegisterComponent } from './pages/profile/diploema-register/diploema-register.component';
import { InstructorRegisterAdminComponent } from './pages/management/instructor-register-admin/instructor-register-admin.component';
import { InstructorRegisterClientComponent } from './pages/profile/instructor-register-client/instructor-register-client.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },

  {
    path: 'contact-us',
    component: ContactUsPageComponent,
  },

  {
    path: 'pruebas',
    component: PruebasComponentesComponent,
  },
  {
    path: 'pruebas-ficheros',
    component: PruebasFicherosComponent,
  },
  {
    path: 'auth',
    component: AuthComponent,
    children: [
      {
        path: 'login',
        component: LoginPageComponent,
        //canActivate: [AuthGuard],
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },

      {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: 'management',
    component: ManagementComponent,
    canActivate: [AuthGuard], // Protegido para "root"
    children: [
      {
        path: 'dashboard',
        component: ManagementDashboardComponent,
      },
      {
        path: 'all-courses', // Add this new route
        component: AllCoursesComponent,
      },
      {
        path: 'course-register-request',
        component: CourseRegisterRequestComponent,
      },
      {
        path: 'certificate-requests',
        component: CertificateRequestsComponent,
      },
      {
        path: 'centers',
        component: CentersComponent,
      },
      {
        path: 'instructor-register',
        component: InstructorRegisterAdminComponent,
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'instructors-catalog',
        component: InstructorsCatalogComponent,
      },
      {
        path: 'instructor-register',
        component: InstructorRegisterClientComponent,
      },
      {
        path: 'course-register',
        component: CourseRegisterComponent,
      },
      {
        path: 'diploema-register',
        component: DiploemaRegisterComponent,
      },
      {
        path: 'my-courses',
        component: MyCoursesComponent,
      },
      {
        path: 'request-aperture',
        component: RequestApertureComponent,
      },
      {
        path: 'aperture-info',
        component: ApertureInfoComponent,
      },
      {
        path: 'request-certificates',
        component: RequestCertificatesComponent,
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

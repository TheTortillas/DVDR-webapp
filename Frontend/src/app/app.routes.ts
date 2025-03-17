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
import { HelpComponent } from './pages/landing/help/help.component';
import { PruebasFicherosComponent } from './pages/pruebas-ficheros/pruebas-ficheros.component';
import { RequestCertificatesComponent } from './pages/profile/request-certificates/request-certificates.component';
import { ManagementComponent } from './pages/management/management.component';
import { ManagementDashboardComponent } from './pages/management/dashboard/dashboard.component';
import { AllCoursesComponent } from './pages/management/all-courses/all-courses.component';
import { CourseRegisterRequestComponent } from './pages/management/course-register-request/course-register-request.component';
import { CertificateRequestsComponent } from './pages/management/certificate-requests/certificate-requests.component';
import { CentersComponent } from './pages/management/centers/centers.component';
import { DiplomaRegisterComponent } from './pages/profile/diploma-register/diploma-register.component';
import { InstructorRegisterAdminComponent } from './pages/management/instructor-register-admin/instructor-register-admin.component';
import { InstructorRegisterClientComponent } from './pages/profile/instructor-register-client/instructor-register-client.component';
import { DiplomaRegisterRequestComponent } from './pages/management/diploma-register-request/diploma-register-request.component';
import { AllDiplomasComponent } from './pages/management/all-diplomas/all-diplomas.component';
import { RequestDiplomaCertificatesComponent } from './pages/profile/request-diploma-certificates/request-diploma-certificates.component';
import { DiplomaCertificateRequestsComponent } from './pages/management/diploma-certificate-requests/diploma-certificate-requests.component';
import { MessagesComponent } from './pages/management/messages/messages.component';
import { UsersComponent } from './pages/management/users/users.component';
import { InstructorsComponent } from './pages/management/instructors/instructors.component';
import { TemplatesComponent } from './pages/management/templates/templates.component';
import { CourseAperturesComponent } from './pages/management/course-apertures/course-apertures.component';
import { CourseRegisterVerificationComponent } from './pages/verification/course-register-verification/course-register-verification.component';
import { VerificationComponent } from './pages/verification/verification.component';
import { VerificationDashboardComponent } from './pages/verification/verification-dashboard/verification-dashboard.component';

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
    path: 'help',
    component: HelpComponent,
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
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: ManagementDashboardComponent,
      },
      {
        path: 'all-courses',
        component: AllCoursesComponent,
      },
      {
        path: 'all-diplomas',
        component: AllDiplomasComponent,
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
        path: 'diploma-certificate-requests',
        component: DiplomaCertificateRequestsComponent,
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
        path: 'diploma-register-request',
        component: DiplomaRegisterRequestComponent,
      },
      {
        path: 'messages',
        component: MessagesComponent,
      },
      {
        path: 'users',
        component: UsersComponent,
      },
      {
        path: 'instructors',
        component: InstructorsComponent,
      },
      {
        path: 'templates',
        component: TemplatesComponent,
      },
      {
        path: 'course-apertures',
        component: CourseAperturesComponent,
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
        path: 'instructor-register',
        component: InstructorRegisterClientComponent,
      },
      {
        path: 'course-register',
        component: CourseRegisterComponent,
      },
      {
        path: 'diploma-register',
        component: DiplomaRegisterComponent,
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
        path: 'request-diploma-certificates',
        component: RequestDiplomaCertificatesComponent,
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
    path: 'verification',
    component: VerificationComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: VerificationDashboardComponent, // Cambiar por el nuevo dashboard específico
      },
      {
        path: 'course-register-request',
        component: CourseRegisterVerificationComponent,
      },
      {
        path: '',
        redirectTo: 'dashboard', // Ahora redirigimos al dashboard
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

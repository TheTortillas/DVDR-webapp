import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ContactUsPageComponent } from './pages/contact-us-page/contact-us-page.component';
import { CourseRegisterComponent } from './pages/course-register/course-register.component';
import { PruebasComponentesComponent } from './pages/pruebas-componentes/pruebas-componentes.component';
import { InstructorRegisterComponent } from './pages/instructor-register/instructor-register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthComponent } from './pages/auth/auth.component';

export const routes: Routes = [

    {
        path: 'home',
        component: HomeComponent
    },

    {
    path: 'login',
    component: LoginPageComponent
    },

    {
        path: 'contact-us',
        component: ContactUsPageComponent
    }, 
    

    {
        path: 'pruebas-componentes',
        component: PruebasComponentesComponent
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
                component: InstructorRegisterComponent
            },
            
            {
                path: 'profile',
                component: ProfileComponent
            },

            {
                path: 'course-register',
                component: CourseRegisterComponent
            }
        ]
        //guards
    },



    {
        path:'',
        redirectTo: 'home',
        pathMatch: 'full',
    },

    {
        path:'**',
        component: PageNotFoundComponent
    }

    
];

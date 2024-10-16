import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ContactUsPageComponent } from './pages/contact-us-page/contact-us-page.component';
import { CourseRegisterComponent } from './pages/course-register/course-register.component';
import { PruebaTablaComponent } from './pages/prueba-tabla/prueba-tabla.component';

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
        path: 'course-register',
        component: CourseRegisterComponent
    },


    {
        path: 'prueba-tabla',
        component: PruebaTablaComponent
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

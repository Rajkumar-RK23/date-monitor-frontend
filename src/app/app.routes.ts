import { Routes } from '@angular/router';
import { Task } from './pages/task/task';
import { SignupComponent } from './pages/signup/signup';
import { LoginComponent } from './pages/login/login';
import { DashboardHomeComponent } from './pages/dashboard-home/home';
import { SettingsComponent } from './pages/settings/settings';
import { ReportsComponent } from './pages/reports/reports';
import { LayoutComponent } from './pages/layout/layout';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard/home', pathMatch: 'full' },
    { path: 'signup', component: SignupComponent },
    { path: 'login', component: LoginComponent },
    {
        path: 'dashboard',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: DashboardHomeComponent },
            { path: 'periods', component: Task },
            { path: 'reports', component: ReportsComponent },
            { path: 'settings', component: SettingsComponent },
        ],
    },
];

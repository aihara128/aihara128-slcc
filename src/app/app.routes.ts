import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guards';
import { AdminComponent } from './admin/admin.component';
import { OperationBillComponent } from './admin/manage-operation/operation-bill/operation-bill.component';

export const routes: Routes = [
    // { path: '', component: AppComponent },
    { path: '', component: LoginComponent },
    // { path: 'admin', component: AdminComponent},
    { path: 'admin', component: AdminComponent , canActivate: [authGuard]},
    { path: 'admin/operationBill', component: OperationBillComponent },
];

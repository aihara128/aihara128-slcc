import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageListComponent } from './manage-list/manage-list.component';
import { ManageServiceComponent } from './manage-service/manage-service.component';
import { ReportComponent } from './report/report.component';
import { ManageUserComponent } from './manage-user/manage-user.component';
import { ManageOperationComponent } from './manage-operation/manage-operation.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ManageListComponent, ManageServiceComponent, ReportComponent, ManageUserComponent, ManageOperationComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  sessionName: string | null = null;
  sessionRoleName : string | null = null;
  isAdmin: string | null = null;

  ngOnInit(): void {
    this.sessionName = sessionStorage.getItem('isName');
    this.sessionRoleName = sessionStorage.getItem('isRoleName');
    this.isAdmin = sessionStorage.getItem('isRole');
  }

  


  logoutAdmin(){
    this.authService.logout();
    this.router.navigate(['/'])
  }
  
  selectedComponent = 'ManageList';

  setComponent(component: string){
    this.selectedComponent = component;
  }



  receiveData(data: any) {
    this.selectedComponent = data; 
    console.log('admin menu',data);
  }

}

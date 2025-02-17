import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject(this.checkSession());

  login(firstName:string, lastName:string, role:number, roleName:string){ 
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('isName', firstName +'  '+ lastName);
    sessionStorage.setItem('isRole', String(role));
    sessionStorage.setItem('isRoleName', roleName);
    this.isLoggedIn.next(true);
  }

  logout(){ 
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('isName');
    sessionStorage.removeItem('isRole');
    sessionStorage.removeItem('isRoleName');
    this.isLoggedIn.next(false);
  }

  private checkSession(): boolean {
    return sessionStorage.getItem('isLoggedIn') === 'true';
  }

  isAuthenticated(): Observable<boolean>{
    return this.isLoggedIn.asObservable();
  }


}

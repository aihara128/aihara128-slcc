import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface LoginResponse {
  role: number;
  firstName: string;
  lastName: string;
  roleName: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, InputTextModule, FormsModule, FloatLabelModule, PasswordModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})



export class LoginComponent {
  loginForm: FormGroup;
  loginError: string = '';

  constructor(private fb: FormBuilder, 
    private http: HttpClient, 
    private router: Router,
    private authService: AuthService ) {

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  // isLoggedIn: Observable<boolean> = this.authService.isAuthenticated()



  onSubmit() {
    
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
      this.http.post<LoginResponse>('/api/login', loginData).subscribe(response => {
          
          if (response) {
            console.log('User is pass');
            this.authService.login(response.firstName, response.lastName, response.role, response.roleName);
            this.router.navigate(['/admin']);
          } else {
            this.loginError = 'Invalid username or password';
            console.log('User is not pass');
          }
        }, error => {
          this.loginError = 'try username or password again';
          console.error('Login failed', error);
        });
    }
  }

}

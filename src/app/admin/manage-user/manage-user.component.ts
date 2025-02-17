import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

interface dataUser {
  userID:number;
  firstName:string;
  lastName:string;
  phoneNumber:string;
  position:string;
  username:string;
  password:string;
  role:number;
  roleName:string;
  isActive:string;
}

@Component({
  selector: 'app-manage-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule ],
  templateUrl: './manage-user.component.html',
  styleUrl: './manage-user.component.css'
})
export class ManageUserComponent implements OnInit {
  userForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      position: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['', Validators.required],
      roleName: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.fetchData();
  }

  onSubmit() {
    if (this.userForm.valid) {
      const formData = this.userForm.value;
      console.log('Form Data:', formData);

      this.http.post('/api/insertUser', formData).subscribe(
        response => {
          console.log('Insert successful:', response);
        },
        error => {
          console.error('Insert failed:', error);
        }
      );
    }
  }



  fetchData(): void {
    this.http.get<dataUser[]>('/api/showUser').subscribe({
      next: (data) => {
        console.log('showDataUser',data);
        this.dataUsers = data;

      },
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });

    }

  dataUsers: dataUser[] = [];

  toggleActive(item: any): void {
    item.isActive = item.isActive === 1 ? 0 : 1;
    // console.log(`Item ID: ${item.userID}, isActive: ${item.isActive}`);

    const dataToSend = {
      isActive:item.isActive,
      userID:item.userID
    }

    this.http.post('/api/updateStatus', dataToSend).subscribe({
      next: (response) => {
        console.log('Update success', response)
      },
      error: (err) => {
        console.error('Update failed', err)
      }
    });
    
  }






}

import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface operationData {
  reportID: string;
  date: string;
  operationID: string;
  customerID: string;
  sizeName: string;
  sumPrice: string;
  comment: string;
  createdAt: string;
  createdBy: string;
  reportServiceID: string;
  price: string;
  operationName: string;
  customerName: string;
  customerCarNo: string;
  customerPhone: string;
  typeName: string;
  brandName: string;
  services: { serviceName: string, price: number }[];
}

@Component({
  selector: 'app-manage-operation',
  standalone: true,
  imports: [HttpClientModule, CommonModule],
  templateUrl: './manage-operation.component.html',
  styleUrl: './manage-operation.component.css'
})
export class ManageOperationComponent implements OnInit {

  constructor(private http: HttpClient,private router: Router) {}
  
  items: any[] = []; // เก็บข้อมูลที่ดึงจาก API
  currentPage = 1; // หน้าปัจจุบัน
  itemsPerPage = 6; // จำนวนข้อมูลต่อหน้า
  totalItems = 0; // จำนวนข้อมูลทั้งหมด

  get paginatedItems() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.items.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number) {
    this.currentPage = page;
  }
  
  getPages(): number[] {
    return Array.from({ length: Math.ceil(this.totalItems / this.itemsPerPage) }, (_, i) => i + 1);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
  

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.http.get<operationData[]>('/api/operationData').subscribe({
      next: (data) => {
        // this.operationData = data;
        this.operationData = data.sort((a, b) => Number(b.reportID) - Number(a.reportID));  
        this.items = data.sort((a, b) => Number(b.reportID) - Number(a.reportID));;
        this.totalItems = data.length; // นับจำนวนข้อมูลทั้งหมด
        console.log(data);
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });
  }

  operationData: operationData[] = [];



  operationBill(item: any, type:any) {
    this.router.navigate(['admin/operationBill'], { state: { item,type } });

  }

  changeStatus(operation: number, item:any): void {
    const createdBy = sessionStorage.getItem('isName');
    const dataTosend = {
      operation: operation,
      createdBy: createdBy,
      reportID: item.reportID
    }
  
    // ตัวอย่างการส่งค่าไปยังเซิร์ฟเวอร์
    this.http.post('/api/updateOperation', dataTosend )
      .subscribe({
        next: (response) => {
          console.log('operation updated successfully:', response);
          this.fetchData();
        },
        error: (error) => {
          console.error('Error updating operation:', error);
        }
      });
  }
  
}

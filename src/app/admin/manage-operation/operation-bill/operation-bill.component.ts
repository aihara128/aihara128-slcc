import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';


 interface OperationItem {
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
  selector: 'app-operation-bill',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './operation-bill.component.html',
  styleUrl: './operation-bill.component.css'
})
export class OperationBillComponent {

  selectedItem: OperationItem | undefined;  // ใช้ interface เพื่อกำหนดประเภท
  selectedType: any | undefined;
  recieve: string | null;

  constructor(private route: ActivatedRoute,private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    // ใช้ bracket notation เพื่อเข้าถึง 'item'
    this.selectedItem = navigation?.extras?.state?.['item'];
    this.selectedType = navigation?.extras?.state?.['type'];
    this.recieve = sessionStorage.getItem('isName');
  }


  ngAfterViewInit(): void {
    // เรียกใช้ฟังก์ชันการพิมพ์หลังจากที่หน้าโหลดเสร็จ
    setTimeout(() => {
      window.print();
    }, 100);
    
  }


}

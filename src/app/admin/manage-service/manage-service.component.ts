import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-service',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './manage-service.component.html',
  styleUrl: './manage-service.component.css'
})
export class ManageServiceComponent implements OnInit{

  constructor( private http:HttpClient){}
  
  ngOnInit(): void {
    this.fetchDataCarBrand();
    this.fetchDataCarType();
    this.fetchDataCarSize();
    this.fetchDataCarService();
  }

  carBrand: any[] = [];
  fetchDataCarBrand(): void {
  this.http.get<any[]>('/api/carBrand').subscribe(
    response => {
      console.log('carBrand', response);
      this.carBrand = response;
      }, error => {
        console.error('carBrabd failed', error);
      });
  }

  carType: any[] = [];  
  fetchDataCarType() {
    this.http.get<any[]>('/api/carType').subscribe({
      next: (data) => {
        console.log(data);
        this.carType = data;
      },
      error: (err) => {
        console.error('Error fetching dataCarType:', err);
      }
    });
  }

  carSize: any[] = [];  
  fetchDataCarSize() {
    this.http.get<any[]>('/api/carSize').subscribe({
      next: (data) => {
        console.log(data);
        this.carSize = data;
      },
      error: (err) => {
        console.error('Error fetching dataCarSize:', err);
      }
    });
  }

  carService: any[] = [];  
  fetchDataCarService() {
    this.http.get<any[]>('/api/carService').subscribe({
      next: (data) => {
        console.log(data);
        this.carService = data;
      },
      error: (err) => {
        console.error('Error fetching dataCarSize:', err);
      }
    });
  }

  comment: string ='';
  selectedSize: string ='';
  selectedType: string ='';
  selectedBrand: string ='';  

  isServiceSelected(): boolean {
    return this.carService.some(service => service.selected); // คืนค่า true ถ้ามี service ที่ selected เป็น true
  }
  

  priceServiceBySize: any = [];
  customerName: string = '';
  customerPhone: string = '';
  customerCarNo: string = '';

  Submit() {
    if (!this.selectedBrand || !this.selectedType || !this.selectedSize || !this.customerName || !this.customerPhone || !this.customerCarNo) {
      console.error('กรอกข้อมูลไม่ครบ');
      return;
    }
  
    if (!this.isServiceSelected()) {
      console.error('กรุณาเลือกรายการบริการอย่างน้อย 1 รายการ');
      return;
    }
  
    // ถ้าข้อมูลครบถ้วนทั้งหมด
    const selectedServices = this.carService
      .filter(service => service.selected)
      .map(service => service.listName);
  
    const selectedSizeName = this.carSize.find(size => size.sizeID === this.selectedSize)?.sizeName || '';
  
    // หาเงินของแต่ละ service by Size
    const selectedServiceID = this.carService
    .filter(service => service.selected)
    .map(service => service.listID);
    
    const createdBy = sessionStorage.getItem('isName');
    const dataCustomer = {
      typeID: this.selectedType,
      brandID: this.selectedBrand,
      customerName: this.customerName,
      customerCarNo: this.customerCarNo,
      customerPhone: this.customerPhone,
      createdBy: createdBy
    }

    // ส่งข้อมูลไปที่ API เพื่อเพิ่มข้อมูลในตาราง report
    

    this.http.post('/api/insertCustomer', dataCustomer).subscribe(response => {

      const customerID = (response as { customerID: number }).customerID;
      
      const dataToSend = {
        customerID: customerID, 
        sumPrice: this.cachedPrice,
        sizeName: selectedSizeName,
        comment: this.comment,
        createdBy: createdBy,
      };

      this.http.post('/api/insertReport', dataToSend).subscribe(response => {
        // รับ reportID ที่สร้างใหม่
        const reportID = (response as { reportID: number }).reportID;
    
        // เพิ่มข้อมูลในตาราง reportService
        const servicesToSend = {
          reportID: reportID,  // อ้างอิงจาก reportID ที่เพิ่งได้
          services: selectedServices.map((service, index) => ({
            name: service,
            price: this.priceServiceBySize[index], // จับคู่ราคากับชื่อบริการ
          }))
        };
  
        this.http.post('/api/insertReportService', servicesToSend).subscribe({
          next: serviceResponse => {
            console.log('เพิ่มข้อมูล reportService สำเร็จ', serviceResponse);
          },
          error: serviceError => {
            console.error('เพิ่มข้อมูล reportService ล้มเหลว', serviceError);
          },
        });
    
        console.log('เพิ่มข้อมูล report สำเร็จ');
        const dataToSend = "ManageOperation";
        this.dataEmitter.emit(dataToSend); // ส่งค่าผ่าน EventEmitter
      }, error => {
        console.error('เพิ่มข้อมูล report ล้มเหลว', error);
      });
    }, error =>{
      console.error(error,'insertCustomerError')
    })
  
  }

  @Output() dataEmitter = new EventEmitter<string>(); // สร้าง EventEmitter


cachedSizeID: string = '';
cachedServiceID: string[] = [];
cachedPrice: string = '';

getPriceDisplay(): string {
  const selectedSizeName = this.carSize.find(size => size.sizeID === this.selectedSize)?.sizeName || '';
  const selectedServiceNames = this.carService
  .filter(service => service.selected)
  .map((service, index) => {
    const serviceName = service.listName;
    const servicePrice = this.priceServiceBySize[index];  // ใช้ index ของบริการเพื่อดึงราคาจาก priceServiceBySize
    return `${serviceName}: ${servicePrice} บาท`;  // รวมชื่อบริการและราคามาแสดง
  })
  .join(' // ');


  const selectedSizeID = this.selectedSize || '';
  const selectedServiceID = this.carService
    .filter(service => service.selected)
    .map(service => service.listID);

  // ตรวจสอบว่าข้อมูลเปลี่ยนแปลงหรือไม่
  const dataHasChanged =
    selectedSizeID !== this.cachedSizeID ||
    JSON.stringify(selectedServiceID) !== JSON.stringify(this.cachedServiceID);

  if (dataHasChanged) {
    // Update cache
    this.cachedSizeID = selectedSizeID;
    this.cachedServiceID = selectedServiceID;

    if (!selectedSizeID || selectedServiceID.length === 0) {
      this.cachedPrice = '';
      return '';
    }

    const dataToSend = { sizeID: selectedSizeID, serviceID: selectedServiceID };

    // ส่งข้อมูลไปที่ API เพื่อดึงราคาจากฐานข้อมูล
    this.http.post<{ prices: number[] }>('/api/getPrice', dataToSend).subscribe({
      next: (data) => {
        // คำนวณราคาที่ได้จากฐานข้อมูลและบันทึกใน cachedPrice
        this.priceServiceBySize = data.prices;
        const totalPrice = data.prices.reduce((sum, price) => sum + price, 0);
        this.cachedPrice = totalPrice.toString();
        console.log('displayPrice',data)
      },
      error: (err) => {
        console.error('Error fetching price:', err);
        this.cachedPrice = 'Error';
      }
    });
  }

  return `ขนาด:[ ${selectedSizeName} ], รายการ:[ ${selectedServiceNames} ], ราคารวม = ${this.cachedPrice}`;
}





}

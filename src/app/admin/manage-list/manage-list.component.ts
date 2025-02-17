import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SizeListPrice {
  priceID: number;
  sizeID: number;
  sizeName: string;
  listID: number;
  listName: string;
  price: number;
}

@Component({
  selector: 'app-manage-list',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './manage-list.component.html',
  styleUrl: './manage-list.component.css'
})


export class ManageListComponent implements OnInit {

  constructor(private http: HttpClient) {}

  isAdmin: string | null = null;
  ngOnInit(): void {
    this.isAdmin = sessionStorage.getItem('isRole');
    this.fetchData();
  }

  fetchData(): void {
    this.http.get<SizeListPrice[]>('/api/showList').subscribe({
      next: (data) => {
        this.sizeListPrices = data;
        console.log('showPrice',data);
        this.uniqueListNames = this.getUniqueListNames();
        this.uniqueSizeNames = this.getUniqueSizeNames();
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });

    this.http.get<any[]>('/api/carType').subscribe({
      next: (data) => {
        console.log(data);
        this.carType = data;
        console.log('showDatataaata:', data);
      },
      error: (err) => {
        console.error('Error fetching dataCarType:', err);
      }
    });

    this.http.get<any[]>('/api/carBrand').subscribe(
      response => {
        console.log('carBrand', response);
        this.carBrand = response;
        }, error => {
          console.error('carBrabd failed', error);
        });

    }
  
  carBrand: any[] = [];
  carType: any[] = [];
  sizeListPrices: SizeListPrice[] = [];
  uniqueListNames: { id: string; name: string }[] = [];
  uniqueSizeNames: { id: string; name: string }[] = [];


  getUniqueListNames(): { id: string; name: string }[] {
  const uniqueListNames = new Map<string, { id: string; name: string }>();
  this.sizeListPrices.forEach(item => {
    if (!uniqueListNames.has(String(item.listID))) {
      uniqueListNames.set(String(item.listID), { id: String(item.listID), name: item.listName });
    }
  });
  console.log(Array.from(uniqueListNames.values()));
  return Array.from(uniqueListNames.values());
  }

  getUniqueSizeNames(): { id: string; name: string }[] {
  const uniqueSizeNames = new Map<string, { id: string; name: string }>();
  this.sizeListPrices.forEach(item => {
    if (!uniqueSizeNames.has(String(item.sizeID))) {
      uniqueSizeNames.set(String(item.sizeID), { id: String(item.sizeID), name: item.sizeName });
    }
  });
  console.log(Array.from(uniqueSizeNames.values()));
  return Array.from(uniqueSizeNames.values());
  }

  selectedPriceId: any;
  showSizeID: any;
  showSizeName: any;
  showListID: any;
  showListName: any;
  showPrice: any;
  openModalUpdatePrice(priceID: any,sizeID: any, sizeName: any,listID: any , listName: any, price: any) {
    this.selectedPriceId = priceID;
    this.showSizeID = sizeID;
    this.showListName = listName;
    this.showSizeName = sizeName;
    this.showPrice = price;
    this.showListID = listID;
  
  }

  updateDataPrice: number = 0;

  updatePrice(priceID: any) {
    const createdBy = sessionStorage.getItem('isName');
    if (priceID !== null) {
      console.log(this.updateDataPrice, priceID);
    const dataToSend = {
      updateDataPrice: this.updateDataPrice,
      priceID: priceID,
      createdBy : createdBy,
    };
    this.http.post('/api/updateDataPrice',dataToSend).subscribe(response => {
      console.log('update price ok')
    }, error => {
      console.error('failed', error);
    });
    } else {
      const dataToInsert = {
        sizeID: this.showSizeID,
        listID: this.showListID,
        updateDataPrice: this.updateDataPrice,
        createdBy : createdBy,
      };
      this.http.post('/api/insertDataPrice',dataToInsert).subscribe(response => {
        console.log('insert price ok')

      }, error => {
        console.error('failed', error);
      });
    }
    this.updateDataPrice = 0;
    this.fetchData();
    }

    inputSize: string = '';
    sizeID: string = '';
    actionSize: string = '';
    modalSizeHead: string = '';
    modalSizeBody: string = '';
    sizeDisable: boolean = false;
    openModalSize(action:string, sizeID:string, sizeName:string){
      if(action == 'insertSize'){
        this.actionSize = action;
        this.modalSizeHead = 'เพิ่มรายการขนาด';
        this.modalSizeBody = 'กรอกรายการขนาดที่ต้องการเพิ่ม';
      } else if (action == 'updateSize') {
        this.actionSize = action;
        this.sizeID = sizeID;
        this.inputSize = sizeName;
        this.modalSizeHead = 'แก้ไขชื่อรายการขนาด';
        this.modalSizeBody = 'กรอกรายการขนาดที่ต้องแก้ไข  ชื่อเดิม [ '+ sizeName +' ]';
      } else if (action == 'deleteSize'){
        this.actionSize = action;
        this.sizeID = sizeID;
        this.inputSize = sizeName;
        this.sizeDisable = true;
        this.modalSizeHead = 'ลบรายการขนาด';
        this.modalSizeBody = 'ขนาดที่ต้องการลบ';
      }
    }

    manageSize() {
      if (!this.actionSize) {
        console.error('No action specified');
        return;
      }
    
      const createdBy = sessionStorage.getItem('isName');
      if (!createdBy) {
        console.error('User is not logged in');
        return;
      }
    
      // ตรวจสอบว่าค่าที่จำเป็นต้องไม่เป็นค่าว่างในกรณีต่าง ๆ
      if ((this.actionSize === 'insertSize' || this.actionSize === 'updateSize') && (!this.inputSize || this.inputSize.trim() === '')) {
        console.error('Input size is required');
        return;
      }
    
      if ((this.actionSize === 'updateSize' || this.actionSize === 'deleteSize') && !this.sizeID) {
        console.error('Size ID is required');
        return;
      }
    
      // เตรียมข้อมูลที่จะส่งไปยัง API
      const sendData: any = {
        action: this.actionSize,
        createdBy: createdBy, // เพิ่มผู้ที่ทำการแก้ไขหรือเพิ่ม
      };
    
      if (this.actionSize === 'insertSize' || this.actionSize === 'updateSize') {
        sendData.size = this.inputSize.trim();
      }
    
      if (this.actionSize === 'updateSize' || this.actionSize === 'deleteSize') {
        sendData.sizeID = this.sizeID;
      }
    
      // เรียกใช้งาน API
      this.http.post('/api/manageSize', sendData).subscribe(
        (response) => {
          console.log(`${this.actionSize} successful`, response);
          this.fetchData(); // โหลดข้อมูลใหม่
        },
        (error) => {
          console.error(`${this.actionSize} failed`, error);
        }
      );
    
      // รีเซ็ตค่า
      this.resetFormSize();
    }
    
    resetFormSize() {
      this.actionSize = '';
      this.inputSize = '';
      this.sizeID = '';
      this.modalSizeHead = '';
      this.modalSizeBody = '';
      this.sizeDisable = false;
    }
    
    inputList: string = '';
    listID: string = '';
    actionList: string = '';
    modalListHead: string='';
    modalListBody: string = '';
    listDisable: boolean = false;
    openModalList(action:string, listID:string, listName:string){
      if(action == 'insertList'){
        this.actionList = action;
        this.modalListHead = 'เพิ่มรายการบริการ';
        this.modalListBody = 'กรอกรายการบริการที่ต้องการเพิ่ม';
      } else if (action == 'updateList') {
        this.actionList = action;
        this.listID = listID;
        this.inputList = listName;
        this.modalListHead = 'แก้ไขชื่อรายการบริการ';
        this.modalListBody = 'กรอกรายการบริการที่ต้องการแก้ไข  ชื่อเดิม [ '+ listName +' ]';
      } else if (action == 'deleteList'){
        this.actionList = action;
        this.listID = listID;
        this.inputList = listName;
        this.modalListHead = 'ลบรายการบริการ';
        this.modalListBody = 'รายการบริการที่ต้องการลบ';
        this.listDisable = true;
      }
    }

    manageList() {
      if (!this.actionList) {
        console.error('No action specified');
        return;
      }
    
      const createdBy = sessionStorage.getItem('isName');
      if (!createdBy) {
        console.error('User is not logged in');
        return;
      }
    
      // ตรวจสอบว่าค่าที่จำเป็นต้องไม่เป็นค่าว่างในกรณีต่าง ๆ
      if ((this.actionList === 'insertList' || this.actionList === 'updateList') && (!this.inputList || this.inputList.trim() === '')) {
        console.error('Input List is required');
        return;
      }
    
      if ((this.actionList === 'updateList' || this.actionList === 'deleteList') && !this.listID) {
        console.error('List ID is required');
        return;
      }
    
      // เตรียมข้อมูลที่จะส่งไปยัง API
      const sendData: any = {
        action: this.actionList,
        createdBy: createdBy, // เพิ่มผู้ที่ทำการแก้ไขหรือเพิ่ม
      };
    
      if (this.actionList === 'insertList' || this.actionList === 'updateList') {
        sendData.list = this.inputList.trim();
      }
    
      if (this.actionList === 'updateList' || this.actionList === 'deleteList') {
        sendData.listID = this.listID;
      }
    
      // เรียกใช้งาน API
      this.http.post('/api/manageList', sendData).subscribe(
        (response) => {
          console.log(`${this.actionList} successful`, response);
          this.fetchData(); // โหลดข้อมูลใหม่
        },
        (error) => {
          console.error(`${this.actionList} failed`, error);
        }
      );
    
      // รีเซ็ตค่า
      this.resetFormList();
    }

    resetFormList() {
      this.actionList = '';
      this.inputList = '';
      this.listID = '';
      this.modalListHead = '';
      this.modalListBody = '';
      this.listDisable = false;
      
    }

    inputCarType: string = '';
    typeID: string = '';
    actionType: string = '';
    modalTypeHead: string='';
    modalTypeBody: string = '';
    typeDisable: boolean = false;
    openModalCarType(action:string, typeID:string, typeName:string){
      if(action == 'insertType'){
        this.actionType = action;
        this.modalTypeHead = 'เพิ่มประเภทรถ';
        this.modalTypeBody = 'กรอกประเภทรถที่ต้องการเพิ่ม';
      } else if (action == 'updateType') {
        this.actionType = action;
        this.typeID = typeID;
        this.inputCarType = typeName;
        this.modalTypeHead = 'แก้ไขชื่อประเภทรถ';
        this.modalTypeBody = 'กรอกประเภทรถที่ต้องแก้ไข  ชื่อเดิม [ '+ typeName +' ]';
      } else if (action == 'deleteType'){
        this.actionType = action;
        this.typeID = typeID;
        this.inputCarType = typeName;
        this.typeDisable = true;
        this.modalTypeHead = 'ลบประเภทรถ';
        this.modalTypeBody = 'ประเภทรถที่ต้องการลบ';
      }
    }

    manageCarType(){
      if (!this.actionType) {
        console.error('No action specified');
        return;
      }
    
      const createdBy = sessionStorage.getItem('isName');
      if (!createdBy) {
        console.error('User is not logged in');
        return;
      }
    
      // ตรวจสอบว่าค่าที่จำเป็นต้องไม่เป็นค่าว่างในกรณีต่าง ๆ
      if ((this.actionType === 'insertList' || this.actionType === 'updateType') && (!this.inputCarType || this.inputCarType.trim() === '')) {
        console.error('Input Type is required');
        return;
      }
    
      if ((this.actionType === 'updateType' || this.actionType === 'deleteType') && !this.typeID) {
        console.error('Type ID is required');
        return;
      }
    
      // เตรียมข้อมูลที่จะส่งไปยัง API
      const sendData: any = {
        action: this.actionType,
        createdBy: createdBy, // เพิ่มผู้ที่ทำการแก้ไขหรือเพิ่ม
      };
    
      if (this.actionType === 'insertType' || this.actionType === 'updateType') {
        sendData.type = this.inputCarType.trim();
      }
    
      if (this.actionType === 'updateType' || this.actionType === 'deleteType') {
        sendData.typeID = this.typeID;
      }
    
      // เรียกใช้งาน API
      this.http.post('/api/manageCarType', sendData).subscribe(
        (response) => {
          console.log(`${this.actionType} successful`, response);
          this.fetchData(); // โหลดข้อมูลใหม่
        },
        (error) => {
          console.error(`${this.actionType} failed`, error);
        }
      );
    
      // รีเซ็ตค่า
      this.resetFormType();
    }

    resetFormType() {
      this.actionType = '';
      this.inputCarType = '';
      this.typeID = '';
      this.modalTypeHead = '';
      this.modalTypeBody = '';
      this.typeDisable = false;
      
    }



    inputCarBrand: string = '';
    brandID: string = '';
    actionBrand: string = '';
    modalBrandHead: string='';
    modalBrandBody: string = '';
    brandDisable: boolean = false;
    openModalCarBrand(action:string, brandID:string, brandName:string){
      if(action == 'insertBrand'){
        this.actionBrand = action;
        this.modalBrandHead = 'เพิ่มยี่ห้อรถ';
        this.modalBrandBody = 'กรอกยี่ห้อรถที่ต้องการเพิ่ม';
      } else if (action == 'updateBrand') {
        this.actionBrand = action;
        this.brandID = brandID;
        this.inputCarBrand = brandName;
        this.modalBrandHead = 'แก้ไขชื่อยี่ห้อรถ';
        this.modalBrandBody = 'กรอกยี่ห้อรถที่ต้องการแก้ไข  ชื่อเดิม [ '+ brandName +' ]';
      } else if (action == 'deleteBrand'){
        this.actionBrand = action;
        this.brandID = brandID;
        this.inputCarBrand = brandName;
        this.modalBrandHead = 'ลบยี่ห้อรถ';
        this.modalBrandBody = 'ยี่ห้อรถที่ต้องการลบ';
        this.brandDisable = true;
      }
    }

    manageCarBrand(){
      if (!this.actionBrand) {
        console.error('No action specified');
        return;
      }
    
      const createdBy = sessionStorage.getItem('isName');
      if (!createdBy) {
        console.error('User is not logged in');
        return;
      }
    
      // ตรวจสอบว่าค่าที่จำเป็นต้องไม่เป็นค่าว่างในกรณีต่าง ๆ
      if ((this.actionBrand === 'insertBrand' || this.actionBrand === 'updateBrand') && (!this.inputCarBrand || this.inputCarBrand.trim() === '')) {
        console.error('Input Brand is required');
        return;
      }
    
      if ((this.actionBrand === 'updateBrand' || this.actionBrand === 'deleteBrand') && !this.brandID) {
        console.error('Brand ID is required');
        return;
      }
    
      // เตรียมข้อมูลที่จะส่งไปยัง API
      const sendData: any = {
        action: this.actionBrand,
        createdBy: createdBy, // เพิ่มผู้ที่ทำการแก้ไขหรือเพิ่ม
      };
    
      if (this.actionBrand === 'insertBrand' || this.actionBrand === 'updateBrand') {
        sendData.brand = this.inputCarBrand.trim();
      }
    
      if (this.actionBrand === 'updateBrand' || this.actionBrand === 'deleteBrand') {
        sendData.brandID = this.brandID;
      }
    
      // เรียกใช้งาน API
      this.http.post('/api/manageCarBrand', sendData).subscribe(
        (response) => {
          console.log(`${this.actionBrand} successful`, response);
          this.fetchData(); // โหลดข้อมูลใหม่
        },
        (error) => {
          console.error(`${this.actionBrand} failed`, error);
        }
      );
    
      // รีเซ็ตค่า
      this.resetFormBrand();
    }

    resetFormBrand() {
      this.actionBrand = '';
      this.inputCarBrand = '';
      this.brandID = '';
      this.modalBrandHead = '';
      this.modalBrandBody = '';
      this.brandDisable = false;
      
    }



}

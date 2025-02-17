import { Component, OnInit, HostListener } from '@angular/core';
import { ChartModule } from 'primeng/chart'
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-report',
  standalone: true,
  imports: [ChartModule, CommonModule, HttpClientModule, FormsModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent implements OnInit {

    constructor( private http:HttpClient){}
  
  
  ngOnInit() {
    this.loadYears();
    this.fetchReports('0','0'); // ดึงข้อมูลทั้งหมดเริ่มต้น
    
  }

  years: number[] = [];
  loadYears() {
    this.http.get<number[]>('/api/getYears').subscribe({
      next: (data) => {
        this.years = data;
      },
      error: (err) => {
        console.error('Error fetching years:', err);
      },
    });
  }

  reports: any[] = [];
  
  selectedYear: string = '0';
  // ฟังก์ชันนี้จะถูกเรียกเมื่อผู้ใช้เลือกปี
  onYearChange(event: Event) {
    const selectedYear = (event.target as HTMLSelectElement).value;
    console.log('Year selected:', selectedYear);

    this.selectedYear = selectedYear;
    this.selectedMonth = '0';

    // เรียกฟังก์ชัน fetchReports เพื่อดึงข้อมูลตามปีที่เลือก
    this.fetchReports(selectedYear,this.selectedMonth);
  }

  months: string[] = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน','กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  selectedMonth: string = '0';
  onMonthChange(event: Event) {
    const selectedMonth = (event.target as HTMLSelectElement).value;
    console.log('Month selected:', selectedMonth);

    this.selectedMonth = selectedMonth;

    const monthIndex = this.months.indexOf(selectedMonth) + 1;

    // เรียกฟังก์ชัน fetchReports เพื่อดึงข้อมูลตามเดือนที่เลือก
    this.fetchReports(this.selectedYear, monthIndex.toString());
  }



  fetchReports(year: string | number, month: string | number) {
    let apiUrl = `/api/getReports?year=${year}`;
    
    if (month && month !== '0') {
      apiUrl += `&month=${month}`;
    }
    
    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {
        this.reports = data.map((report) => ({
        ...report,
        services: report.services || [] // เพิ่ม services ที่ดึงมาจาก API
      })).sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // เรียงจากใหม่ไปเก่า
      });
        this.updateChart(); // อัปเดตกราฟเมื่อได้รับข้อมูลใหม่
        this.updatePieChartSize();
        this.updatePieChartBrand();
        this.updatePieChartType();
        this.serviceCount = this.reports.length;
        this.summarizeServices();
        console.log('showReport',this.reports)
      },
      error: (err) => {
        console.error('Error fetching reports:', err);
      },
    });
  }

  getTotalSumPrice(): number {
    return this.reports.reduce((sum, report) => sum + report.sumPrice, 0);
  }

  serviceCount: number = 0; // จำนวนครั้งเริ่มต้น
  topic_barGraph: string = 'จำนวนเงินบริการในแต่ละปี';
  chartData: any;
  chartOptions: any;
  updateChart(): void {
    if (this.selectedYear === '0' && this.selectedMonth === '0') {

      this.topic_barGraph = 'จำนวนเงินบริการในแต่ละปี';
      // กรณีแสดงข้อมูลของทุกปี
      const yearSummary = this.reports.reduce((acc, report) => {
        const year = new Date(report.date).getFullYear(); // ดึงปีจากวันที่
        if (!acc[year]) {
          acc[year] = 0; // เริ่มต้นยอดขายของปีนั้น
        }
        acc[year] += report.sumPrice; // รวมยอดขายของปีนั้น
        return acc;
      }, {} as { [key: number]: number });
  
      const labels = Object.keys(yearSummary); // รายการปี
      const data = Object.values(yearSummary); // ยอดขายรวมของแต่ละปี
  
      this.chartData = {
        labels: labels,
        datasets: [
          {
            label: 'ยอดขายรวมต่อปี (บาท)',
            data: data,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      };
    } else if (this.selectedYear != '0' && this.selectedMonth ==='0') {
      this.topic_barGraph = 'จำนวนเงินบริการในแต่ละเดือน';
    // สร้างโครงสร้าง 12 เดือนเริ่มต้นด้วยค่า 0
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const monthlyData: { [month: string]: number } = {};
  months.forEach((month) => (monthlyData[month] = 0));

  // เติมข้อมูลจาก reports
  this.reports.forEach((report) => {
    const month = new Date(report.date).toLocaleString('en-US', { month: 'short' }); // ดึงชื่อเดือน เช่น "Jan"
    if (monthlyData[month] !== undefined) {
      monthlyData[month] += report.sumPrice; // รวมยอดขายในเดือนนั้น
    }
  });

  // สร้าง labels และ data สำหรับกราฟ
  const labels = months; // ใช้ชื่อเดือนเรียงลำดับคงที่
  const data = months.map((month) => monthlyData[month]); // ดึงค่าในแต่ละเดือน
  
      this.chartData = {
        labels: labels,
        datasets: [
          {
            label: 'ยอดขายรายรวมเดือน (บาท)',
            data: data,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      };
    } else {
    this.topic_barGraph = 'จำนวนเงินบริการในแต่ละวัน';
    const dailySummary = this.reports.reduce((acc, report) => {
      if (!acc[report.date]) {
        acc[report.date] = 0; // เริ่มต้นยอดขายเป็น 0 ถ้ายังไม่มีวันที่นี้
      }
      acc[report.date] += report.sumPrice; // รวมยอดขายในวันนั้น
      return acc;
    }, {} as { [date: string]: number });

    const sortedDates = Object.keys(dailySummary).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    const labels = sortedDates; // วันที่ที่เรียงแล้ว
    const data = sortedDates.map((date) => dailySummary[date]); // ยอดขายรวมที่สอดคล้องกับวันที่

    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'ยอดขายรายวัน (บาท)',
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };

    }
  
    // อัปเดต options และข้อมูลของกราฟ
    this.chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
      },
      scales: {
        x: {
          beginAtZero: true,
        },
        y: {
          beginAtZero: true,
        },
      },
    };
  }
  

  pieChartDataBySize: any;
  pieChartOptionsBySize: any;
  updatePieChartSize() {
    const sizeCounts: { [key: string]: number } = {};

    // นับจำนวนแต่ละขนาด
    this.reports.forEach((report) => {
      sizeCounts[report.sizeName] = (sizeCounts[report.sizeName] || 0) + 1;
    });

    console.log('ssss',sizeCounts)

    // เตรียมข้อมูลสำหรับแผนภูมิ
    this.pieChartDataBySize = {
      labels: Object.keys(sizeCounts), // ขนาดรถ
      datasets: [
        {
          data: Object.values(sizeCounts), // จำนวนในแต่ละขนาด
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'], // สีในแผนภูมิ
          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        },
      ],
    };

    // ตัวเลือกเพิ่มเติม
    this.pieChartOptionsBySize = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    };
  }

  pieChartDataByBrand: any;
  pieChartOptionsByBrand: any;
  updatePieChartBrand() {
    const brandCounts: { [key: string]: number } = {};

    // นับจำนวนแต่ละยี่ห้อ
    this.reports.forEach((report) => {
      brandCounts[report.brandName] = (brandCounts[report.brandName] || 0) + 1;
    });

    // เตรียมข้อมูลสำหรับแผนภูมิ
    this.pieChartDataByBrand = {
      labels: Object.keys(brandCounts), // ชื่อยี่ห้อ
      datasets: [
        {
          data: Object.values(brandCounts), // จำนวนในแต่ละยี่ห้อ
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#F7464A'], // สีในแผนภูมิ
          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#F7464A'],
        },
      ],
    };

    // ตัวเลือกเพิ่มเติม
    this.pieChartOptionsByBrand = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    };
  }

  pieChartDataByType: any;
  pieChartOptionsByType: any;
  updatePieChartType() {
    const typeCounts: { [key: string]: number } = {};


    this.reports.forEach((report) => {
      typeCounts[report.typeName] = (typeCounts[report.typeName] || 0) + 1;
    });


    this.pieChartDataByType = {
      labels: Object.keys(typeCounts),
      datasets: [
        {
          data: Object.values(typeCounts), 
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#F7464A'], // สีในแผนภูมิ
          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#F7464A'],
        },
      ],
    };

    this.pieChartOptionsByType = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    };
  }

  summarizedServices: any[] = [];
  summarizeServices(): void {
    const serviceMap: { [key: string]: { count: number; total: number } } = {};

    // Loop ข้อมูลจาก API และสรุปข้อมูลการบริการ
    this.reports.forEach((report) => {
      report.services.forEach((service: any) => {
        if (!serviceMap[service.serviceName]) {
          serviceMap[service.serviceName] = { count: 0, total: 0 };
        }

        serviceMap[service.serviceName].count += 1;
        serviceMap[service.serviceName].total += service.price;
      });
    });

    // แปลงเป็น Array เพื่อใช้ใน Template
    this.summarizedServices = Object.keys(serviceMap).map((serviceName) => ({
      serviceName,
      count: serviceMap[serviceName].count,
      total: serviceMap[serviceName].total
    }));
  }

  isShowScroll = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isShowScroll = window.scrollY > 300; // ปรับค่าตามต้องการ
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationBillComponent } from './operation-bill.component';

describe('OperationBillComponent', () => {
  let component: OperationBillComponent;
  let fixture: ComponentFixture<OperationBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationBillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

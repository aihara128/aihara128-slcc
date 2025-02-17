import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageOperationComponent } from './manage-operation.component';

describe('ManageOperationComponent', () => {
  let component: ManageOperationComponent;
  let fixture: ComponentFixture<ManageOperationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageOperationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

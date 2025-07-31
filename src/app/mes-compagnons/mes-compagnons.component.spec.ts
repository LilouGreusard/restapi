import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesCompagnonsComponent } from './mes-compagnons.component';

describe('MesCompagnonsComponent', () => {
  let component: MesCompagnonsComponent;
  let fixture: ComponentFixture<MesCompagnonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesCompagnonsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MesCompagnonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

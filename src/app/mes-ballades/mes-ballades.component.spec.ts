import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesBalladesComponent } from './mes-ballades.component';

describe('MesBalladesComponent', () => {
  let component: MesBalladesComponent;
  let fixture: ComponentFixture<MesBalladesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesBalladesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MesBalladesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

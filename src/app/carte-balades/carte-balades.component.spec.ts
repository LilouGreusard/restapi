import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarteBaladesComponent } from './carte-balades.component';

describe('CarteBaladesComponent', () => {
  let component: CarteBaladesComponent;
  let fixture: ComponentFixture<CarteBaladesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarteBaladesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarteBaladesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

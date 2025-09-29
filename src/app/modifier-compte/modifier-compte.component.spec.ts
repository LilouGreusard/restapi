import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierCompteComponent } from './modifier-compte.component';

describe('ModifierCompteComponent', () => {
  let component: ModifierCompteComponent;
  let fixture: ComponentFixture<ModifierCompteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifierCompteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifierCompteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

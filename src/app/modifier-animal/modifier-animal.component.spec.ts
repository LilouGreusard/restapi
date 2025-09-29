import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierAnimalComponent } from './modifier-animal.component';

describe('ModifierAnimalComponent', () => {
  let component: ModifierAnimalComponent;
  let fixture: ComponentFixture<ModifierAnimalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifierAnimalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifierAnimalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationAnimalComponent } from './creation-animal.component';

describe('CreationAnimalComponent', () => {
  let component: CreationAnimalComponent;
  let fixture: ComponentFixture<CreationAnimalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreationAnimalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreationAnimalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

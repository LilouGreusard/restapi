import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationBalladeComponent } from './creation-ballade.component';

describe('CreationBalladeComponent', () => {
  let component: CreationBalladeComponent;
  let fixture: ComponentFixture<CreationBalladeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreationBalladeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreationBalladeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

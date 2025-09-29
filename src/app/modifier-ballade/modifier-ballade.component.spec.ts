import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierBalladeComponent } from './modifier-ballade.component';

describe('ModifierBalladeComponent', () => {
  let component: ModifierBalladeComponent;
  let fixture: ComponentFixture<ModifierBalladeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifierBalladeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifierBalladeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

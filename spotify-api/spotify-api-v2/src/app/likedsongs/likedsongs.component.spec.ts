import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LikedsongsComponent } from './likedsongs.component';

describe('LikedsongsComponent', () => {
  let component: LikedsongsComponent;
  let fixture: ComponentFixture<LikedsongsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LikedsongsComponent]
    });
    fixture = TestBed.createComponent(LikedsongsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

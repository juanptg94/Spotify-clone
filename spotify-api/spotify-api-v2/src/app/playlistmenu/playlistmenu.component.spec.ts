import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistmenuComponent } from './playlistmenu.component';

describe('PlaylistmenuComponent', () => {
  let component: PlaylistmenuComponent;
  let fixture: ComponentFixture<PlaylistmenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlaylistmenuComponent]
    });
    fixture = TestBed.createComponent(PlaylistmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

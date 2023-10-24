import { Component, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { SharedserviceService } from '../sharedservice.service';
import { MediaPlayerComponent } from '../media-player/media-player.component';

@Component({
  selector: 'app-plantilla',
  templateUrl: './plantilla.component.html',
  styleUrls: ['./plantilla.component.scss']
})
export class PlantillaComponent {

  @ViewChild('mediaPlayer') public mediaPlayer!: MediaPlayerComponent;
  constructor(private toolbarService: SharedserviceService) { }
  ngAfterViewInit() {

    this.toolbarService.setMediaplayer(this.mediaPlayer);
  }
 

}

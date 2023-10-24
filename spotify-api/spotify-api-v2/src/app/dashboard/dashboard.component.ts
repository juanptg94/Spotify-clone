import { Component } from '@angular/core';
import { SpotifyapiService } from '../spotifyapi.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  constructor(private Spotifyapi:SpotifyapiService){}
  access_token:any;
 
 
}

import { Component } from '@angular/core';

import { Observable } from 'rxjs';
import { SpotifyapiService } from '../spotifyapi.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(private Spotifyapi: SpotifyapiService) { 
    this.getCode();
    sessionStorage.removeItem('token') //borrando el token anterior para que pueda tomar el nuevo;
  }
  getCode(): any {
    window.location.href='http://localhost:3001/login'
   


  }

  
}

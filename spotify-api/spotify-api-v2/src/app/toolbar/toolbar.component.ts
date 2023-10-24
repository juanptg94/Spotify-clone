import { Component, Input, Output, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SharedserviceService } from '../sharedservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { SpotifyapiService } from '../spotifyapi.service';
import { selectJwtToken } from '../store/selectors/jwt-token.selectors';
import { Store, select } from '@ngrx/store';
import { setJwtToken } from '../store/actions/jwt-token.actions';
@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {

  searchQuery: string = ''
  userImage:any;
  accessToken:any;
  constructor(private router: Router,private toolbarService: SharedserviceService,private Spotifyapi: SpotifyapiService ,private store:Store) {}
  async ngOnInit() {
    let tToken = await this.getToken();
    this.accessToken=tToken;
    this.userImage=await this.getCurrentUserImage(tToken);
  }
  ngAfterViewInit() { 
   

  }
  getToken = () => {
    return new Promise<string>( async (resolve, reject) => {
     var accesstk:any ;
   

      accesstk = this.store.pipe(select(selectJwtToken));
      accesstk.subscribe((token: any) => {
        if(token!=null){  
          resolve(token)
        }
       
      })

     

    });
  }
  routeIncludesNot(route: string) {
    return !window.location.pathname.startsWith(route);
  }

  isSearchRoute(): boolean {
    return this.router.url.includes('/search');
  }
  handleSearch() {
 


    this.toolbarService.emitEvent(this.searchQuery);
  }
  getCurrentUserImage = (token: any) => {
    return new Promise<string>((resolve, reject) => {
      this.Spotifyapi.getCurrentUserProfile(token).subscribe(res => {
       
        let { data } = res;
       
        let {images:userimage}=data;
      
        resolve(userimage[1].url);

      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(token).subscribe(async (res:any)=>{

            
            let {token}=res;
        
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.getCurrentUserImage(token))

            
          })
        }
      });
    });
  }
  enviarUserProfile(){
    this.router.navigate(['/dashboard/userprofile']);
  }
  loggingOut(){
    window.location.href =  'https://accounts.spotify.com/logout'
  }
 

}

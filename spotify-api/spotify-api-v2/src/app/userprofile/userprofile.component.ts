import { Component } from '@angular/core';
import { SpotifyapiService } from '../spotifyapi.service';
import { Store, select } from '@ngrx/store';
import { selectJwtToken } from '../store/selectors/jwt-token.selectors';
import { setJwtToken } from '../store/actions/jwt-token.actions';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.scss']
})
export class UserprofileComponent {
  userprofile:any;
  constructor(private Spotifyapi:SpotifyapiService,private store: Store){}
  async ngOnInit(){
    var tToken = await this.getToken();
    var userprofiledata= await this.getCurrentUserProfile(tToken)
    this.userprofile = userprofiledata;
  }
  getToken = () => {
    return new Promise<string>(async (resolve, reject) => {
      var accesstk: any;


      accesstk = this.store.pipe(select(selectJwtToken));
      accesstk.subscribe((token: any) => {
        if (token != null) {
          resolve(token)
        }

      })



    });
  }
  getCurrentUserProfile = (token: any) => {
    return new Promise<any>((resolve, reject) => {
      this.Spotifyapi.getCurrentUserProfile(token).subscribe(res => {
       
        let { data } = res;
       
       
        let {images:userimage}=data;
        let {display_name}=data;
        let {email}=data;
        let {country}=data;
        let {followers:{total}}=data;
        let userprofiledata={
          name:display_name,
          userimage:userimage[1].url,
          email:email,
          country:country,
          followers:total
        }
        resolve(userprofiledata); //

      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(token).subscribe(async (res:any)=>{

            
            let {token}=res;
        
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.getCurrentUserProfile(token))

            
          })
        }
      });
    });
  }
}

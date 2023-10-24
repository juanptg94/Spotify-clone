import { Component } from '@angular/core';
import { SpotifyapiService } from '../spotifyapi.service';
import { Store, select } from '@ngrx/store';
import { selectJwtToken } from '../store/selectors/jwt-token.selectors';
import { setJwtToken } from '../store/actions/jwt-token.actions';

@Component({
  selector: 'app-createplaylist',
  templateUrl: './createplaylist.component.html',
  styleUrls: ['./createplaylist.component.scss']
})
export class CreateplaylistComponent {
  constructor(private Spotifyapi:SpotifyapiService,private store:Store){}
  async createPlaylist(){
    var nameInput = document.getElementById("name") as HTMLInputElement;
    var descriptionInput = document.getElementById("description") as HTMLInputElement;
    var name= nameInput.value;
    var description= descriptionInput.value;
    var tToken= await this.getToken();
    var user_id= await this.getCurrentUserID(tToken);

    var playlistres= await this.sendingPlaylistInfo(tToken,user_id,name,description)
    
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
  getCurrentUserID = (token: any) => {
    return new Promise<string>((resolve, reject) => {
      this.Spotifyapi.getCurrentUserProfile(token).subscribe(res => {
        let { data } = res;
        let { id } = data;

        resolve(id);

      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(token).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.getCurrentUserID(token));

            
          })
        }
      });
    });
  }
  sendingPlaylistInfo= (tToken:any,user_id:any,name:any,description:any) =>{
    return new Promise<string>((resolve, reject) => {


     this.Spotifyapi.createPlaylist(tToken,user_id,name,description,true).subscribe(res =>{
        resolve(res);
     },(error)=>{
      if(error.status===401){
        this.Spotifyapi.refreshJwtToken(tToken).subscribe(async (res:any)=>{

          
          let {token}=res;
          this.store.dispatch(setJwtToken({ jwtToken: token }))
          resolve(await this.sendingPlaylistInfo(token,user_id,name,description))

          
        })
      }
    });
     });
  }
}

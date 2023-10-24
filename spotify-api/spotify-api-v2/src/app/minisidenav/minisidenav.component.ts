import { Component, OnInit } from '@angular/core';
import { SharedserviceService } from '../sharedservice.service';
import { SpotifyapiService } from '../spotifyapi.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { select } from '@ngrx/store';
import { getJwtToken, setJwtToken } from '../store/actions/jwt-token.actions';
import { selectJwtToken } from '../store/selectors/jwt-token.selectors';
import { Observable, Subscription } from 'rxjs';
import { Token } from '@mui/icons-material';

@Component({
  selector: 'app-minisidenav',
  templateUrl: './minisidenav.component.html',
  styleUrls: ['./minisidenav.component.scss']
})
export class MinisidenavComponent implements OnInit {
  followedartist: any = [];
  userplaylists: any = [];
  userlikedtracks: any = [];
  userlikedalbums: any = [];
  access_token: any;
  tooltipContent: string = 'Default tooltip content \n otra chimbada';
  constructor(public toolbarService: SharedserviceService, private Spotifyapi: SpotifyapiService, private store: Store,private router:Router) { }

  ngOnInit(): void {

  }
  toggleDrawer() {

    this.toolbarService.toggle();
    this.toolbarService.minisidenavhidden = true;
  }
  enviarInicio() {
    this.router.navigate(['/dashboard/inicio']);
  }
  
  enviarBusqueda() {
    this.router.navigate(['/dashboard/search']);
  }

  async ngAfterViewInit() {
     this.access_token = await this.getToken();
     
      var tToken=this.access_token;
     var user_id = await this.getCurrentUserID(tToken);

    

     this.followedartist=await this.getFollowedArtists(tToken);
     this.userplaylists= await this.getUserPlaylists(tToken,user_id);
     this.userlikedtracks=await this.getUserSavedTracks(tToken);
    this.userlikedalbums= await this.checkLikedAlbums(tToken);
    
   
   
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
            resolve(await this.getCurrentUserID(token))

            
          })
        }
      });
    });
  }
  getFollowedArtists = (token: any) => {
    return new Promise<any>((resolve, reject) => {

      var artistsreturned:any=[];
      this.Spotifyapi.getFollowedartists(token).subscribe((res) => {
        let {data}=res;
       
        let {artists}=data;
    
        let{items}=artists;

        items.forEach((item:any) => {
          let {name:artistName}=item;
          let{images:artistImages}=item;
          let {id:artistid}=item;
          var url="";
          if(artistImages[0] !== undefined){
            url= artistImages[0].url;
          }
          else {
            url= "https://icon-library.com/images/saxophone-icon/saxophone-icon-9.jpg";
         }
          let artist={
              artistName:artistName,artistImages:url, type:"Artista", artistid:artistid
          }
          
       
          artistsreturned.push(artist);
        });
     
        resolve(artistsreturned);
      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(token).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.getFollowedArtists(token))

            
          })
        }
      });



    });
  }
  getUserPlaylists = (token: any, user_id: any) => {
    return new Promise<any>((resolve, reject) => {
      var playlistreturned:any=[];
      this.Spotifyapi.getUserPlaylists(token, user_id).subscribe((res) => {
        let {data}= res;
        let {items}= data;
        items.forEach((item:any) => {
          let {name:playlistName}=item;
          let {images:playlistImages}=item;
          let {owner}=item;
          let {id:playlistid}=item;
          let {display_name:username}=owner;
          
         
         if (Array.isArray(playlistImages) && playlistImages.length === 0) {
          // URL is represented as [], do something here
          playlistImages.push({ url: "https://cdn.icon-icons.com/icons2/2024/PNG/512/music_playlist_icon_123837.png"})
        }
          let playlist={
              playlistName:playlistName,
              playlistImages:playlistImages[0].url,
              username:username,type:"Lista",playlistid:playlistid
          }
          
          playlistreturned.push(playlist);
        });

        resolve(playlistreturned);
      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(token).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.getUserPlaylists(token,user_id))

            
          })
        }
      });



    });
  }
  getUserSavedTracks = (token: any) => {
    return new Promise<string>((resolve, reject) => {
      this.Spotifyapi.getUserSavedTracks(token).subscribe((res) => {
        let {data}= res;
       

      


        resolve(res);
      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(token).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.getUserSavedTracks(token))

            
          })
        }
      });



    });
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
  getArtist(artistid: any) {
    
   
    

    const url = [`/dashboard/artista`, artistid]

    this.router.navigate(url)
    
 

  }
  enviarLikedSongs(){
    this.router.navigate(['/dashboard/userlikedsongs'])
  }
  getPlaylist(playlistid: any) {
    
   
    
    const url = [`/dashboard/playlist`, playlistid];

    
    this.router.navigate(url)

  }
  checkLikedAlbums(tToken:any){
    return new Promise<boolean>( async (resolve, reject) => {
      var albumsreturned:any=[];
      this.Spotifyapi.getUserSavedAlbums(tToken).subscribe((res)=>{
         
          let {data} = res;
          
         
          let {items}= data;
        items.forEach((item:any) => {
          let {album} = item;
          let {name:albumName}=album;
          let {images:albumImages}=album;
          let {id:albumID}=album;
          let {album_type:type}=album;
          let {artists:Albumartists}= album;
          var album_artists= "";
          Albumartists.forEach((artist:any)=>{
              album_artists=album_artists+artist.name;
              
          })
          let albumobject={
            albumName:albumName,
            albumImages:albumImages[0].url,
           albumID:albumID,
           type:type,
           album_artists:album_artists
        }
        albumsreturned.push(albumobject)

        });
     
      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(tToken).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.checkLikedAlbums(token))

            
          })
        }
      });
      resolve(albumsreturned)
     });
   
  }
  getAlbum(albumid: any) {
    
   
    
    const url = [`/dashboard/album`, albumid];


    
    this.router.navigate(url)

  }
 
}

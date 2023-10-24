import { Component, ViewChild } from '@angular/core';
import { SharedserviceService } from '../sharedservice.service';
import { SpotifyapiService } from '../spotifyapi.service';
import { YoutubePlayerComponent } from '../youtube-player/youtube-player.component';
import { Store, select } from '@ngrx/store';
import { selectJwtToken } from '../store/selectors/jwt-token.selectors';
import { setJwtToken } from '../store/actions/jwt-token.actions';
import { Router } from '@angular/router';

const youtubeApiKey = 'AIzaSyCDAuETjt5Lbls2w6yJ9JyUoiNVeeTgo-s';
export interface Track { ///CAMBIARLO POR INTERFACE DEL ARTISTA
  titulo: string;
  position: number;
 
  duracion: number;

}

@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss']
})
export class AlbumComponent {
  @ViewChild('player') public player!: YoutubePlayerComponent;
  displayedColumns: string[] = ['num', 'titulo', 'duracion'];
  ELEMENT_DATA: Track[] = [];
  dataSource: any;
  albumImage:any;
  albumName: any;
  SongID:any="nosong";
  savedAlbum:any;
  accessToken:any;
  albumID:any;
  likedSongs:any=[]
  tracksIDs:any=[]
  menuOptions:any=[]
  constructor(private Spotifyapi: SpotifyapiService, private toolbarService: SharedserviceService,private store:Store, private router: Router) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
   }
  async ngOnInit(): Promise<void> {

    var id = window.location.href.split('/').pop();
    this.albumID=id;
    
    let tToken = await this.getToken();
    this.accessToken = tToken;

    var album=await this.getAlbum(tToken,id);

    album.forEach((albumsong:any)=>{
     
        this.tracksIDs.push(albumsong.trackid);

    })
 
    this.checkLikedSong(tToken,this.tracksIDs).then((data:any)=>{
     
      this.likedSongs = data;
    })
    this.ELEMENT_DATA=album;
    this.dataSource=this.ELEMENT_DATA;
    var user_id= await this.getCurrentUserID(tToken);
    this.menuOptions=await this.getUserPlaylists(tToken,user_id); 
    this.savedAlbum= await this.checkSavedAlbum(id)
  
 
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
          let {display_name:username}=owner;
          let {id:playlistid}=item;
       
          if(playlistImages.length ==0){
           playlistImages="https://cdn.icon-icons.com/icons2/2024/PNG/512/music_playlist_icon_123837.png"
          }
          let playlist={
              playlistName:playlistName,playlistImages:playlistImages,username:username,type:"Lista",playlistid:playlistid
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
  async checkLikedSong(token:any,trackids:any[]):Promise<boolean[]>{
   
    const promises = trackids.map(trackId => this.checkSavedTrack(token,trackId));
    const results = await Promise.all(promises);
    


      return results;
  
    

  }
  checkSavedTrack(tToken:any,trackid:string){
    return new Promise<boolean>( async (resolve, reject) => {
      this.Spotifyapi.checkSavedTrack(tToken,trackid).subscribe((res)=>{
         
          let {data} = res;
          var likedsong=data[0];
          
          resolve(likedsong);
      },(error)=>{
     
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(tToken).subscribe(async (res:any)=>{

            
            let {token}=res;
          
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.checkSavedTrack(token,trackid))

            
          })
        }
      });
      
 
     });
   
  }
  ngAfterViewInit() {
 

    this.toolbarService.setPlayer(this.player);
  }
  getAlbum = (tToken: any, id: any) => {
    return new Promise<any[]>((resolve, reject) => {
      var albumTracks:any=[]
      this.Spotifyapi.getAlbum(tToken, id).subscribe((res:any) => {

      
        let {data} = res;
       let { tracks } = data;
         let { items } = tracks;
  
         let {images:trackimages}=data;
         let {name:albumName}=data;
         let {artists:trackartists}=data;

         this.albumName=albumName;
         this.albumImage=trackimages[1].url;
         
       
         var pos=0;
        items.forEach((item:any) => {
          let {name:trackname}=item;
          let { duration_ms}=item;

          var timeseconds=duration_ms/1000;
          var minutes= Math.floor(timeseconds/60);
          var seconds=  Math.floor(timeseconds%60);
    
          var display = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
          let {id:trackid}=item;
      
          var displaytrack = { position: pos, titulo: trackname,  duracion: display,albumImage:trackimages[1].url,trackartists:trackartists,trackid:trackid,};
          albumTracks.push(displaytrack);
          pos=pos+1;
        });
       
       resolve(albumTracks);
      },(error)=>{
     
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(tToken).subscribe(async (res:any)=>{

            
            let {token}=res;
   
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.getAlbum(token,id))

            
          })
        }
      });




    });
  }
  selectToPlaylist(trackid:any, event:Event){
    event.stopPropagation();
  
}
async addToPlaylist(playlistid:any,trackid:any){
    
 
  var addresult= await this.addTrackToPlaylist(playlistid,trackid);
  
  
}
addTrackToPlaylist(playlistid:any,trackid:any){
  return new Promise<string>( async (resolve, reject) => {
    
    this.Spotifyapi.addTrackToPlaylist(this.accessToken,playlistid,trackid).subscribe((data)=>{
       
    
        resolve(data);
    },(error)=>{
    
      if(error.status===401){
        this.Spotifyapi.refreshJwtToken(this.accessToken).subscribe(async (res:any)=>{

          
          let {token}=res;
          this.accessToken=token;
     
          this.store.dispatch(setJwtToken({ jwtToken: token }))
          resolve(await this.addTrackToPlaylist(playlistid,trackid))

          
        })
      }
    });
    

   });
 
}
  async getSong(row:any):Promise<void>{
    var titulo=row.titulo;
  
    this.toolbarService.setDisplayImage(row.albumImage);
 
    this.toolbarService.setSongName(titulo);
    this.toolbarService.setSongArtists(row.trackartists);
    titulo=titulo.replace(" ","+")
    var artista= this.albumName.replaceAll(" ","+")

    var queryString= artista+"+-+"+titulo;
   
   var Songiden= await this.getSongID(youtubeApiKey,queryString)
    this.SongID=Songiden;
    //("El coño: "+Songiden);
   
    this.toolbarService.updateVideo([Songiden]);
    this.toolbarService.activateAnimation();
    
 
    
  }
  getSongID = (youtubeKey:string,queryString:string) => {
    return new Promise<void>((resolve, reject) => {
      this.Spotifyapi.getSongID(youtubeApiKey,queryString).subscribe((res)=>{

        let {items} = res;
        let ID= items[0].id;
        let {videoId}=ID;
      
     
        resolve(videoId)
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
  async playAlbumSongs(event: Event) {
   
    var artistSongsIDS: any = []
     for (const song of this.dataSource){
     
       var trackname= song.titulo;
       trackname = encodeURIComponent(trackname);
       
       var artists= song.trackartists;
       var artista = "";
       artists.forEach((artist:any) => {
         artista = artista + " " + artist.name;
   
       });
   
       artista = encodeURIComponent(artista);
       var queryString = artista + "+" + trackname;
   
       var Songiden = await this.getSongID(youtubeApiKey, queryString)
       artistSongsIDS.push(Songiden);
    
       
     }

  
    this.SongID=artistSongsIDS;

    this.toolbarService.updateVideo(artistSongsIDS);

  }
  checkSavedAlbum(albumid:any){
    return new Promise<boolean>( async (resolve, reject) => {
      this.Spotifyapi.checkSavedAlbum(this.accessToken,albumid).subscribe((res)=>{
        
          let {data} = res;
          var likedsong=data[0];
        
          resolve(likedsong);
      },(error)=>{
      
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(this.accessToken).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.accessToken=token;
         
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.checkSavedAlbum(token))

            
          })
        }
      });
      
 
     });
   
  }
  followSpotifyAlbum(albumid:string){
    return new Promise<boolean>( async (resolve, reject) => {
      this.Spotifyapi.saveAlbum(this.accessToken,albumid).subscribe((res)=>{
     
         
          resolve(res);
      },(error)=>{
    
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(this.accessToken).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.accessToken=token;
     
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.followSpotifyAlbum(albumid))

            
          })
        }
      });
      
 
     });
   
  }
  unfollowSpotifyAlbum(albumid:string){
    return new Promise<boolean>( async (resolve, reject) => {
      this.Spotifyapi.removeAlbum(this.accessToken,albumid).subscribe((res)=>{
     
         
          resolve(res);
      },(error)=>{
      
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(this.accessToken).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.accessToken=token;
     
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.unfollowSpotifyAlbum(albumid))

            
          })
        }
      });
      
 
     });
   
  }
  async followAlbum(event: Event){

    var followedAlbum= await this.checkSavedAlbum(this.albumID);
   
   
    if(followedAlbum){
        this.unfollowSpotifyAlbum(this.albumID)
    
        this.savedAlbum=!this.savedAlbum;
    }else{
        this.followSpotifyAlbum(this.albumID)
        
        this.savedAlbum=!this.savedAlbum;
    }
  }
  async likeSong(trackid:any,event:Event){
    event.stopPropagation();
    const target = event.target as HTMLElement;
    const isFilledHeart = target.classList.contains('bi-balloon-heart-fill');

    
    if(isFilledHeart){
    
        target.classList.remove('bi-balloon-heart-fill');
        target.classList.add('bi-balloon-heart');
        await this.removeTrack(trackid);
    }
    else{
      target.classList.remove('bi-balloon-heart');
      target.classList.add('bi-balloon-heart-fill');
      await this.saveTrack(trackid); 

    }
     
    
  
   
    

  }
  saveTrack(trackid:string){
    return new Promise<string>( async (resolve, reject) => {
      
      this.Spotifyapi.saveTrack(this.accessToken,trackid).subscribe((data)=>{
      
      
          resolve(data);
      },(error)=>{
      
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(this.accessToken).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.accessToken=token;
       
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.saveTrack(trackid))

            
          })
        }
      });
      
 
     });
   
  }
  removeTrack(trackid:string){
    return new Promise<string>( async (resolve, reject) => {
      
      this.Spotifyapi.removeTrack(this.accessToken,trackid).subscribe((data)=>{
       
      
          resolve(data);
      },(error)=>{
    
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(this.accessToken).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.accessToken=token;
      
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.removeTrack(trackid))

            
          })
        }
      });
      
 
     });
   
  }
  
}

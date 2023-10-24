import { ChangeDetectorRef, Component } from '@angular/core';
import { SpotifyapiService } from '../spotifyapi.service';
import { YoutubePlayerComponent } from '../youtube-player/youtube-player.component';
import { ViewChild } from '@angular/core'
import { SharedserviceService } from '../sharedservice.service';
import { Store, select } from '@ngrx/store';
import { selectJwtToken } from '../store/selectors/jwt-token.selectors';
const youtubeApiKey = 'AIzaSyCDAuETjt5Lbls2w6yJ9JyUoiNVeeTgo-s';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { setJwtToken } from '../store/actions/jwt-token.actions';
export interface Track { ///CAMBIARLO POR INTERFACE DEL ARTISTA
  titulo: string;
  position: number;
  popularidad: number;
  duracion: string;
  album_url: string;
}

/*const ELEMENT_DATA: Track[] = [
  {position: 1, titulo: 'Hydrogen', popularidad: 1.0079, duracion: 'H'},
  {position: 2, titulo: 'Helium', popularidad: 4.0026, duracion: 'He'},
  {position: 3, titulo: 'Lithium', popularidad: 6.941, duracion: 'Li'},
  {position: 4, titulo: 'Beryllium', popularidad: 9.0122, duracion: 'Be'},
  {position: 5, titulo: 'Boron', popularidad: 10.811, duracion: 'B'},
  {position: 6, titulo: 'Carbon', popularidad: 12.0107, duracion: 'C'},
  {position: 7, titulo: 'Nitrogen', popularidad: 14.0067, duracion: 'N'},
  {position: 8, titulo: 'Oxygen', popularidad: 15.9994, duracion: 'O'},
  {position: 9, titulo: 'Fluorine', popularidad: 18.9984, duracion: 'F'},
  {position: 10, titulo: 'Neon', popularidad: 20.1797, duracion: 'Ne'},
];*/
@Component({
  selector: 'app-artista',
  templateUrl: './artista.component.html',
  styleUrls: ['./artista.component.scss']
})
export class ArtistaComponent {
  @ViewChild('player') public player!: YoutubePlayerComponent;
  @ViewChild('Playlistmenu', { static: false }) menuTrigger!: MatMenuTrigger;

  ELEMENT_DATA: Track[] = [];
  displayedColumns: string[] = ['num', 'titulo', 'numerovistas', 'duracion'];
  dataSource: any;
  artist: any;
  tracklist: any = [];
  artistName:any;
  SongID:any="nosong";
  accessToken: any;
  likedSongs:any=[]
  menuOptions:any=[]
  artistID:any;
  followedArtist:any


  constructor(private Spotifyapi: SpotifyapiService,private toolbarService: SharedserviceService, private store:Store,private router:Router,private cdr: ChangeDetectorRef) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }
   ngOnInit() {
    this.initOperations();
    
  }
  async initOperations(){
    var trackarray:any=[];
    var id = window.location.href.split('/').pop();
    this.artistID=id;
    let tToken = await this.getToken();
    this.accessToken=tToken;
    this.accessToken=tToken;
    var artista:any = await this.getArtist(tToken, id);
  
    var {name:artistn}=artista;
    this.artistName=artistn;
    this.followedArtist=await this.checkFollowedArtist(this.artistID)
    var user_id= await this.getCurrentUserID(tToken);
    this.menuOptions=await this.getUserPlaylists(tToken,user_id); 
    this.fetchTopTracks(tToken,id).then((dataSource:any)=>{
      dataSource.forEach(async (track:any)=>{
      
        let{trackid}=track;
      
       
      
        trackarray.push(trackid);

      });
   
      this.checkLikedSong(trackarray).then((data)=>{
        this.likedSongs = data;
      })
      
      this.dataSource=dataSource;
     
     
    })
    


   
    
  }
  getLikedSongs(): any {
    var array_liked=[]
    
    //this.checkLikedSong()

  }
  ngAfterViewInit() {
 
   
    this.toolbarService.setPlayer(this.player);
  
  }

  fetchTopTracks = (tToken: any, id: any) => {
    return new Promise<void>((resolve, reject) => {
      var array_tracks:any = [];
  this.Spotifyapi.getTopTracks(tToken, id).subscribe((res) => {


      let { data } = res
      let { tracks } = data;
      var pos = 1;
      tracks.forEach((track: any) => {
        let { album } = track;
        let { images: trackimages } = album;
        let {artists:trackartists}=album;
        let { name: trackname } = track;
        let{id}=track;
        let { duration_ms } = track;
        let { popularity } = track;
        var timeseconds=duration_ms/1000;
        var minutes= Math.floor(timeseconds/60);
        var seconds=  Math.floor(timeseconds%60);
      
        var display = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
      
        var displaytrack = { position: pos, titulo: trackname, popularidad: popularity, duracion: display, album_url: trackimages[2].url,trackartists:trackartists,trackid:id};

        array_tracks.push(displaytrack);
        pos = pos + 1;
      });


      resolve(array_tracks);


    },(error)=>{
    
      if(error.status===401){
        this.Spotifyapi.refreshJwtToken(this.accessToken).subscribe(async (res:any)=>{

          
          let {token}=res;
          this.accessToken=token;
          
          this.store.dispatch(setJwtToken({ jwtToken: token }))
          resolve(await this.fetchTopTracks(token,id))

          
        })
      }
    });
  
   

    });
  }

  getArtist = (tToken: any, id: any) => {
    return new Promise<void>((resolve, reject) => {

      this.Spotifyapi.getArtist(tToken, id).subscribe((res) => {


        let { data } = res
        let { images } = data;
        let { name } = data;

        this.artist = { images: images, name: name }
        resolve(this.artist)
      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(this.accessToken).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.accessToken=token;
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.getArtist(token,id))

            
          })
        }
      });




    });
  }
  async getSong(row:any):Promise<void>{
    var titulo=row.titulo;
    this.toolbarService.setDisplayImage(row.album_url);
    titulo=titulo.replace(" ","+")
    var artista= this.artistName.replaceAll(" ","+")
    this.toolbarService.setDisplayImage(row.album_url);
 
    this.toolbarService.setSongName(titulo);
    this.toolbarService.setSongArtists(row.trackartists);
    var queryString= artista+"+-+"+titulo;
    var Songiden= await this.getSongID(youtubeApiKey,queryString)
    this.SongID=Songiden;
    this.toolbarService.updateVideo([this.SongID]);
 
    
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
  async likeSong(trackid:any,event:Event){
    event.stopPropagation();
    const target = event.target as HTMLElement;
    const isFilledHeart = target.classList.contains('bi-balloon-heart-fill');
    ("Que hay aca entonces pues PERRA HPTA"+JSON.stringify(this.likedSongs))
    if(isFilledHeart){
        ("AY AY ME GUSTA X3")
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
  checkSavedTrack(trackid:string){
    return new Promise<boolean>( async (resolve, reject) => {
      this.Spotifyapi.checkSavedTrack(this.accessToken,trackid).subscribe((res)=>{
         
          let {data} = res;
          var likedsong=data[0];
        
          resolve(likedsong);
      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(this.accessToken).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.accessToken=token;
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.checkSavedTrack(trackid))

            
          })
        }
      });
      
 
     });
   
  }
  
  async checkLikedSong(trackids:any[]):Promise<boolean[]>{
   
    const promises = trackids.map(trackId => this.checkSavedTrack(trackId));
    const results = await Promise.all(promises);
    

      return results;
  
    

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
  selectToPlaylist(trackid:any, event:Event){
      event.stopPropagation();
    
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

  ngOnDestroy() {
    if (this.player) {
      // Set the reference to null to destroy the component
      this.player.destroy();
    }
  }
  async playArtistSongs(event: Event) {
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
       (""+queryString);
       var Songiden = await this.getSongID(youtubeApiKey, queryString)
       artistSongsIDS.push(Songiden);
       
     }
   
    this.SongID=artistSongsIDS;
    this.toolbarService.updateVideo(artistSongsIDS);

  }
  async followArtist(event: Event){
    var followedArtist= await this.checkFollowedArtist(this.artistID);
    const target = event.target as HTMLElement;
   
    var trackarray:any=[];
    if(followedArtist){
        this.unfollowSpotifyArtist(this.artistID)
      
        this.followedArtist=!this.followedArtist;
        this.fetchTopTracks(this.accessToken,this.artistID).then((dataSource:any)=>{
          dataSource.forEach(async (track:any)=>{
          
            let{trackid}=track;
           
          
            trackarray.push(trackid);
    
          });
          this.checkLikedSong(trackarray).then((data)=>{
            this.likedSongs = data;
          })
          
          this.dataSource=dataSource;
         
          this.cdr.detectChanges();
        })
        

       

    }else{
        this.followSpotifyArtist(this.artistID)
        
        this.followedArtist=!this.followedArtist;
        this.fetchTopTracks(this.accessToken,this.artistID).then((dataSource:any)=>{
          dataSource.forEach(async (track:any)=>{
          
            let{trackid}=track;
           
          
            trackarray.push(trackid);
    
          });
          this.checkLikedSong(trackarray).then((data)=>{
            this.likedSongs = data;
          })
          
          this.dataSource=dataSource;
          this.cdr.detectChanges();
         
        })
       
    }
  }
  checkFollowedArtist(artistid:string){
    return new Promise<boolean>( async (resolve, reject) => {
      this.Spotifyapi.checkFollowedArtist(this.accessToken,artistid).subscribe((res)=>{
          let {data} = res;
          var likedsong=data[0];
        
          resolve(likedsong);
      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(this.accessToken).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.accessToken=token;
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.checkFollowedArtist(artistid))

            
          })
        }
      });
      
 
     });
   
  }
  followSpotifyArtist(artistid:string){
    return new Promise<boolean>( async (resolve, reject) => {
      this.Spotifyapi.followArtist(this.accessToken,artistid).subscribe((res)=>{
         
          resolve(res);
      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(this.accessToken).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.accessToken=token;
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.followSpotifyArtist(artistid))

            
          })
        }
      });
      
 
     });
   
  }
  unfollowSpotifyArtist(artistid:string){
    return new Promise<boolean>( async (resolve, reject) => {
      this.Spotifyapi.unfollowArtist(this.accessToken,artistid).subscribe((res)=>{
         
          resolve(res);
      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(this.accessToken).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.accessToken=token;
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.unfollowSpotifyArtist(artistid))

            
          })
        }
      });
      
 
     });
   
  }
}

 
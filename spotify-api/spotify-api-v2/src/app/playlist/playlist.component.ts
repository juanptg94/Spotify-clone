import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { SpotifyapiService } from '../spotifyapi.service';
import { Store, select } from '@ngrx/store';
import { selectJwtToken } from '../store/selectors/jwt-token.selectors';
import { SharedserviceService } from '../sharedservice.service';
import { YoutubePlayerComponent } from '../youtube-player/youtube-player.component';
import { setJwtToken } from '../store/actions/jwt-token.actions';
import { Router } from '@angular/router';
const youtubeApiKey = 'AIzaSyCDAuETjt5Lbls2w6yJ9JyUoiNVeeTgo-s';
export interface Track { ///CAMBIARLO POR INTERFACE DEL ARTISTA
  titulo: string;
  position: number;

  duracion: number;

}
@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent {
  @ViewChild('player') public player!: YoutubePlayerComponent;
  displayedColumns: string[] = ['num', 'titulo', 'duracion'];
  ELEMENT_DATA: Track[] = [];
  dataSource: any;
  playlistImage: any;
  playlistName: any;
  playlist_id: any;
  snapshotID: any;
  likedSongs: any = []
  SongID: any = "nosong";
  accessToken: any;
  tracksIDs: any = []
  menuOptions: any = []
  constructor(private Spotifyapi: SpotifyapiService, private store: Store, private toolbarservice: SharedserviceService, private cdr: ChangeDetectorRef,private router: Router) { 
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }
  async ngOnInit(): Promise<void> {
    var playlist_id = window.location.href.split('/').pop();
    let tToken = await this.getToken();
    this.accessToken = tToken;
    var playlistdata = await this.getUserPlaylistbyid(tToken, playlist_id);


    this.ELEMENT_DATA = playlistdata;

    this.dataSource = this.ELEMENT_DATA;
    playlistdata.forEach((albumsong: any) => {
      this.tracksIDs.push(albumsong.trackid);

    })
    this.checkLikedSong(this.tracksIDs).then((data: any) => {
      this.likedSongs = data;
    })

    var user_id= await this.getCurrentUserID(tToken);
    this.menuOptions=await this.getUserPlaylists(tToken,user_id); 

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
  selectToPlaylist(trackid: any, event: Event) {
    event.stopPropagation();

  } async addToPlaylist(playlistid: any, trackid: any) {

    var addresult = await this.addTrackToPlaylist(playlistid, trackid);


  }
  addTrackToPlaylist(playlistid: any, trackid: any) {
    return new Promise<string>(async (resolve, reject) => {

      this.Spotifyapi.addTrackToPlaylist(this.accessToken, playlistid, trackid).subscribe((data) => {

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
  ngAfterViewInit() {

    this.toolbarservice.setPlayer(this.player);
  }

  getUserPlaylistbyid = (token: any, playlist_id: any) => {
    return new Promise<any>((resolve, reject) => {
      var playlistreturned: any = [];
      this.Spotifyapi.getPlaylistbyid(token, playlist_id).subscribe((res) => {

        let { data } = res;
        let { tracks } = data;
        let { snapshot_id } = data;
        this.snapshotID = snapshot_id;
        let { name: playlistname } = data;
        let { id: playlistid } = data;
        let { images: playlistimages } = data;
        this.playlistName = playlistname;
        this.playlist_id = playlistid;
        if (playlistimages.length > 0) {
          this.playlistImage = playlistimages[0].url;
        }

        let { items } = tracks;
        var pos = 0;
        items.forEach((item: any) => {
          let { track } = item;
          let { album } = track;
          let { id: trackid } = track;
          let { name: trackname } = track;
          let { images } = album;
          let { duration_ms } = track;
          var timeseconds=duration_ms/1000;
        var minutes= Math.floor(timeseconds/60);
        var seconds=  Math.floor(timeseconds%60);
        var display = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
          let { artists } = album;
          var playlisttrack = { position: pos, titulo: trackname, duracion: display, trackid: trackid, images: images[0].url, artists: artists };
          playlistreturned.push(playlisttrack);
          pos = pos + 1;
        });

        resolve(playlistreturned);
      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(token).subscribe(async (res:any)=>{

            
            let {token}=res;
        
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.getUserPlaylistbyid(token,playlist_id))

            
          })
        }
      });



    });
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
  async getSong(row: any): Promise<void> {
    var titulo = row.titulo;
    titulo = titulo.replace(" ", "+")
    this.toolbarservice.setDisplayImage(row.images);

    this.toolbarservice.setSongName(titulo);
    this.toolbarservice.setSongArtists(row.artists);
    var artists = row.artists;
    var searchartistfield = "";

    artists.forEach((artist: any) => {
      let { name } = artist;


      searchartistfield = searchartistfield.concat(" ", name);
    })
    var artista = searchartistfield.replaceAll(" ", "+")

    var queryString = artista + "+-+" + titulo;
    var Songiden = await this.getSongID(youtubeApiKey, queryString)
    this.SongID = Songiden;
    this.toolbarservice.updateVideo([this.SongID]);


  }
  getSongID = (youtubeKey: string, queryString: string) => {
    return new Promise<void>((resolve, reject) => {
      this.Spotifyapi.getSongID(youtubeApiKey, queryString).subscribe((res) => {

        let { items } = res;
        let ID = items[0].id;
        let { videoId } = ID;


        resolve(videoId)
      });




    });
  }
  async removeSongFromPlaylist(trackid: any, event: Event) {




    event.stopPropagation();
    var addresult = await this.removeTrackToPlaylist(this.playlist_id, trackid);
    var playlistdata = await this.getUserPlaylistbyid(this.accessToken, this.playlist_id);

    this.ELEMENT_DATA = playlistdata;

    this.dataSource = this.ELEMENT_DATA;
    this.cdr.detectChanges();
  }
  removeTrackToPlaylist(playlistid: any, trackid: any) {
    return new Promise<string>(async (resolve, reject) => {
      this.Spotifyapi.removeTrackToPlaylist(this.accessToken, playlistid, trackid, this.snapshotID).subscribe((data) => {

        resolve(data);
      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(this.accessToken).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.accessToken=token;
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.removeTrackToPlaylist(playlistid,trackid))

            
          })
        }
      });


    });

  }
  async playPlaylistSongs(event: Event) {
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

    this.SongID = artistSongsIDS;
    this.toolbarservice.updateVideo(artistSongsIDS);

  }
  async likeSong(trackid: any, event: Event) {
    event.stopPropagation();
    const target = event.target as HTMLElement;
    const isFilledHeart = target.classList.contains('bi-balloon-heart-fill');
    if (isFilledHeart) {
      target.classList.remove('bi-balloon-heart-fill');
      target.classList.add('bi-balloon-heart');
      await this.removeTrack(trackid);
    }
    else {
      target.classList.remove('bi-balloon-heart');
      target.classList.add('bi-balloon-heart-fill');
      await this.saveTrack(trackid);

    }






  }
  removeTrack(trackid: string) {
    return new Promise<string>(async (resolve, reject) => {

      this.Spotifyapi.removeTrack(this.accessToken, trackid).subscribe((data) => {

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
  saveTrack(trackid: string) {
    return new Promise<string>(async (resolve, reject) => {

      this.Spotifyapi.saveTrack(this.accessToken, trackid).subscribe((data) => {

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
  async checkLikedSong(trackids: any[]): Promise<boolean[]> {

    const promises = trackids.map(trackId => this.checkSavedTrack(trackId));
    const results = await Promise.all(promises);


    return results;



  }
  checkSavedTrack(trackid: string) {
    return new Promise<boolean>(async (resolve, reject) => {
      this.Spotifyapi.checkSavedTrack(this.accessToken, trackid).subscribe((res) => {

        let { data } = res;
        var likedsong = data[0];

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
}

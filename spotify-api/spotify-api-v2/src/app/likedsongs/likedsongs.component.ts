import { ChangeDetectorRef, Component } from '@angular/core';
import { SpotifyapiService } from '../spotifyapi.service';
import { Store, select } from '@ngrx/store';
import { selectJwtToken } from '../store/selectors/jwt-token.selectors';
import { SharedserviceService } from '../sharedservice.service';
import { YoutubePlayerComponent } from '../youtube-player/youtube-player.component';
import { ViewChild } from '@angular/core'
import { setJwtToken } from '../store/actions/jwt-token.actions';
const youtubeApiKey = 'AIzaSyCDAuETjt5Lbls2w6yJ9JyUoiNVeeTgo-s';
export interface Track { ///CAMBIARLO POR INTERFACE DEL ARTISTA
  titulo: string;
  position: number;

  duracion: number;

}
@Component({
  selector: 'app-likedsongs',
  templateUrl: './likedsongs.component.html',
  styleUrls: ['./likedsongs.component.scss']
})
export class LikedsongsComponent {
  @ViewChild('player') public player!: YoutubePlayerComponent;
  displayedColumns: string[] = ['num', 'titulo', 'duracion'];
  ELEMENT_DATA: Track[] = [];
  dataSource: any;
  playlistImage: any;
  SongID: any = "nosong";
  playlistName: any;
  menuOptions: any = []
  likedSongs: any = []
  accessToken: any;

  constructor(private Spotifyapi: SpotifyapiService, private store: Store, private toolbarservice: SharedserviceService,private cdr: ChangeDetectorRef) { }
  async ngOnInit(): Promise<void> {
    var trackarray: any = [];
    let tToken = await this.getToken();
    this.accessToken = tToken;
    var likedsongs = await this.getUserSavedTracks(tToken);
    this.ELEMENT_DATA = likedsongs;
    this.dataSource = this.ELEMENT_DATA;


    var user_id = await this.getCurrentUserID(tToken);
    this.menuOptions = await this.getUserPlaylists(tToken, user_id);
    this.dataSource.forEach(async (track: any) => {

      let { trackid } = track;


      trackarray.push(trackid);

    });
    this.checkLikedSong(trackarray).then((data) => {
      this.likedSongs = data;
    })

  }
  ngAfterViewInit() {

    this.toolbarservice.setPlayer(this.player);
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
  getUserSavedTracks = (token: any) => {
    return new Promise<any>((resolve, reject) => {
      var likedsongsreturned: any = [];
      this.Spotifyapi.getUserSavedTracks(token).subscribe((res) => {
        let { data } = res;
        let { items } = data;
        var pos = 0;
        items.forEach((item: any) => {
          let { track } = item;
          let { name: trackname } = track;
          let { id: trackid } = track;
          let { duration_ms } = track;
          let { album } = track;
          let { images } = album;
          let { artists } = album;


          var likedtrack = { position: pos, titulo: trackname, duracion: duration_ms, trackid: trackid, images: images[0].url, artists: artists };
          likedsongsreturned.push(likedtrack);
          pos = pos + 1;
        });





        resolve(likedsongsreturned);
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
  async getSong(row: any): Promise<void> {
    var titulo = row.titulo;
    titulo = titulo.replace(" ", "+")

    var artists = row.artists;
    var searchartistfield = "";
    this.toolbarservice.setDisplayImage(row.images);
 
    this.toolbarservice.setSongName(titulo);
    this.toolbarservice.setSongArtists(row.artists);
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
  getUserPlaylists = (token: any, user_id: any) => {
    return new Promise<any>((resolve, reject) => {
      var playlistreturned: any = [];
      this.Spotifyapi.getUserPlaylists(token, user_id).subscribe((res) => {
        let { data } = res;
        let { items } = data;
        items.forEach((item: any) => {
          let { name: playlistName } = item;
          let { images: playlistImages } = item;
          let { owner } = item;
          let { display_name: username } = owner;
          let { id: playlistid } = item;
          if (playlistImages.length == 0) {
            playlistImages = "https://cdn.icon-icons.com/icons2/2024/PNG/512/music_playlist_icon_123837.png"
          }
          let playlist = {
            playlistName: playlistName, playlistImages: playlistImages, username: username, type: "Lista", playlistid: playlistid
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
  async addToPlaylist(playlistid: any, trackid: any) {

  
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
  selectToPlaylist(trackid: any, event: Event) {
    event.stopPropagation();

  }
  async likeSong(trackid: any, event: Event) {
    var trackarray: any = [];
    event.stopPropagation();
    const target = event.target as HTMLElement;
    const isFilledHeart = target.classList.contains('bi-balloon-heart-fill');
   
     
      await this.removeTrack(trackid);
      var likedsongs = await this.getUserSavedTracks(this.accessToken);
     
      this.ELEMENT_DATA = likedsongs;
      this.dataSource = this.ELEMENT_DATA;
  
   
    this.dataSource.forEach(async (track: any) => {

      let { trackid } = track;


      trackarray.push(trackid);

    });
    this.checkLikedSong(trackarray).then((data) => {
      this.likedSongs = data;
    })
    this.cdr.detectChanges();




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

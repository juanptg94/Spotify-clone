import { Component, NgModule, ViewChild } from '@angular/core';
import { SpotifyapiService } from '../spotifyapi.service';
import { take, firstValueFrom, map } from 'rxjs';
import { Store, StoreModule, select } from '@ngrx/store';


import { JwtTokenReducer } from '../store/reducers/jwt-token.reducer';
import { selectJwtToken } from '../store/selectors/jwt-token.selectors';
import { setJwtToken, getJwtToken } from '../store/actions/jwt-token.actions';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import * as exp from 'constants';
import { YoutubePlayerComponent } from '../youtube-player/youtube-player.component';
import { SharedserviceService } from '../sharedservice.service';
import { Token } from '@mui/icons-material';
const youtubeApiKey = 'AIzaSyA66sTHagpzOuGipqQaZPvtADxX_MdppME';
@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})

export class InicioComponent {
  @ViewChild('player') public player!: YoutubePlayerComponent;
  userTopTracks: any = [];
  releases: any = [];
  refreshToken: any;
  expires_in: any;
  featuredPlaylists: any = []
  recommendedArtistsSongs: any = []
  recommendedArtistsSongsNames: any = []
  SongID: any = "nosong";
  constructor(private Spotifyapi: SpotifyapiService, private store: Store, private router: Router, private toolbarService: SharedserviceService) {

  }


  async ngOnInit() {

    let jwtToken = await this.setToken();
    if (jwtToken == undefined) {


      jwtToken = await this.getToken();


    }
    this.store.dispatch(setJwtToken({ jwtToken: jwtToken }))
    this.releases = await this.getSeveralTracks(jwtToken);
this.featuredPlaylists = await this.getFeaturedPlaylists(jwtToken);

  
   
  

  }
 
  ngAfterViewInit() {

    this.toolbarService.setPlayer(this.player);

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
  setToken = () => {
    return new Promise<any>((resolve, reject) => {
      var accesstk: any;
      const code = new URLSearchParams(window.location.search).get('code');
      if (code != null) {
        this.Spotifyapi.getAccessToken(code).subscribe((res: any) => {
          let { data } = res
          let { jwtToken } = data;








          resolve(jwtToken);



        })
      }
      else {
        resolve(undefined);
      }




    });
  }


  refreshJwtToken = (accessToken: any) => {
    return new Promise<string>((resolve, reject) => {
      



      this.Spotifyapi.refreshJwtToken(accessToken).subscribe((res: any) => {
        let { token } = res;


        resolve(token)

      })


    });
  }



  getSeveralTracks(token: any) {
    var releasesarray: any = [];
    return new Promise((resolve, reject) => {
      
      this.Spotifyapi.getSeveralTracks(token).subscribe((res: any) => {
       
          let { data } = res
          let { albums } = data;
          let { items } = albums;


          items.forEach((element: any) => {
            let { artists } = element;
            let { images } = element;
            let { name: albumname } = element;  //Album name
            let { id: albumid } = element;
            let { album_type } = element;
            let { release_date } = element;
            artists.forEach((element2: any) => {
              //The artist name
              let { name: artistname } = element2;
              //tipo de artista let { type } = element2;
              let { id: artistid } = element2;
              release_date = release_date.split('-')[0]
              let artist = {
                albumname: albumname, images: images, album_type: album_type, albumid: albumid, artistname: artistname, release_date: release_date, artistid: artistid,
              }

              releasesarray.push(artist);
            });
          });


          resolve(releasesarray);


      

      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(token).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.getSeveralTracks(token))

            
          })
        }
      })

    })
  }

  getFeaturedPlaylists(token: any) {
    var releasesarray: any = [];
    return new Promise((resolve, reject) => {
      var featuredPlaylists: any = [];
      this.Spotifyapi.getFeaturedPlaylist(token).subscribe((res: any) => {



        let { data } = res;
        let { playlists } = data;
        let { items } = playlists;
        //("vea los items: " + JSON.stringify(items))
        items.forEach((item: any) => {
          //("CADA UNOS DE LOS PEDAZOS: " + JSON.stringify(item))
          let { id: playlistid } = item;
          let { images: playlistImages } = item;
          let { name: playlistName } = item;
          let { description } = item;
          let playlist = {
            playlistName: playlistName, images: playlistImages, playlistid: playlistid, description: description
          }
          featuredPlaylists.push(playlist);
        });

        resolve(featuredPlaylists);
      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(token).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.getFeaturedPlaylists(token))

            
          })
        }
      })

    })
  }

  getArtist(artistname: any) {
    var artistid2: any;

    var url: any;
    this.releases.forEach((element: any) => {
      let { artistname: artista } = element;

      if (artista == artistname) {
        let { artistid } = element;
        artistid2 = artistid;
      }
      url = [`/dashboard/artista`, artistid2];





    });

    this.router.navigate(url);
  }
 

  getAlbum(albumname: any) {
    var albumid2: any;
    var url: any;

    this.releases.forEach((element: any) => {
      let { albumname: album } = element;

      if (album == albumname) {
        let { albumid } = element;
        albumid2 = albumid;
      }
      url = [`/dashboard/album`, albumid2];





    });
    this.router.navigate(url);

  }
  getPlaylist(playlistid: any) {


    var url = [`/dashboard/playlist`, playlistid];






    this.router.navigate(url);

  }
  

  async getSong(trackname: any, artists: any[]): Promise<void> {

    trackname = trackname.replace(" ", "+");

    var artista = "";
    artists.forEach(artist => {
      artista = artista + " " + artist.name;

    });

    artista = artista.replaceAll(" ", "+")

    var queryString = artista + "+-+" + trackname;
    var Songiden = await this.getSongID(youtubeApiKey, queryString)
    this.SongID = Songiden;
    this.toolbarService.updateVideo([this.SongID]);


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
}




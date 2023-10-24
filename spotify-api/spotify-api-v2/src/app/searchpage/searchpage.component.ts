import { Component, ViewChild } from '@angular/core';
import { SharedserviceService } from '../sharedservice.service';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { Subscription } from 'rxjs';
import { SpotifyapiService } from '../spotifyapi.service';
import { YoutubePlayerComponent } from '../youtube-player/youtube-player.component';
import { Store, select } from '@ngrx/store';
import { selectJwtToken } from '../store/selectors/jwt-token.selectors';
import { getJwtToken, setJwtToken } from '../store/actions/jwt-token.actions';
import { Router } from '@angular/router';
const youtubeApiKey = 'AIzaSyA66sTHagpzOuGipqQaZPvtADxX_MdppME';
@Component({
  selector: 'app-searchpage',
  templateUrl: './searchpage.component.html',
  styleUrls: ['./searchpage.component.scss']
})
export class SearchpageComponent {
  @ViewChild('player') public player!: YoutubePlayerComponent;
  private eventSubscription: Subscription | undefined;;
  searchTerm: string = "";
  songList: any = [];
  artistList: any = [];
  albumList: any = [];
  playlistList: any = [];
  searchrequested: boolean = true;
  SongID: any = "nosong";
  displaySongs: any = [];
  mainArtist: any;
  accessToken: any;
  likedSongs: any = []
  artistSongs: any = []

  constructor(private toolbarService: SharedserviceService, private Spotifyapi: SpotifyapiService, private store: Store, private router: Router) {


  }
  async ngAfterViewInit() {
    this.toolbarService.setPlayer(this.player);
    var tToken = await this.getToken();
    this.accessToken = tToken;
    this.toolbarService.eventEmitter.subscribe((searchQuery) => {
      // Handle the event logic 
      this.searchTerm = searchQuery;
      this.spotifySearch(tToken, searchQuery);
     
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
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.checkSavedTrack(trackid))

            
          })
        }
      });


    });

  }
  async spotifySearch(token: any, searchQuery: string) {
    this.searchrequested = true;
    var trackList = await this.getSearchedTracks(token, searchQuery);
    trackList = JSON.stringify(trackList);


    var TracksObject = JSON.parse(trackList);





    this.songList = TracksObject;

    this.displaySongs = TracksObject.slice(0, 4);
    var trackarray: any = [];
    this.displaySongs.forEach(async (track: any) => {
      let { trackid } = track;


      trackarray.push(trackid);

    });
    this.checkLikedSong(trackarray).then((data: any) => {
      this.likedSongs = data;
    })

    var artistList = await this.getSearchedArtists(token, searchQuery);
    artistList = JSON.stringify(artistList);


    var artistsObject = JSON.parse(artistList);
    this.artistList = artistsObject;



    this.mainArtist = artistsObject.slice(0, 1);

    
    this.fetchTopTracks(this.accessToken, this.mainArtist[0].artistid).then((dataSource: any) => {
      
      this.artistSongs = dataSource;
    


    })

    var albumList = await this.getSearchedAlbums(token, searchQuery);
    albumList = JSON.stringify(albumList);


    var albumsObject = JSON.parse(albumList);
    this.albumList = albumsObject;

    var playlistList = await this.getSearchedPlaylists(token, searchQuery);

    playlistList = JSON.stringify(playlistList);


    var playlistsObject = JSON.parse(playlistList);
    this.playlistList = playlistsObject;





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
  fetchTopTracks = (tToken: any, id: any) => {
    return new Promise<void>((resolve, reject) => {
      var array_tracks: any = [];
      this.Spotifyapi.getTopTracks(tToken, id).subscribe((res) => {


        let { data } = res
        let { tracks } = data;
        var pos = 1;
        tracks.forEach((track: any) => {
          let { album } = track;
          let { images: trackimages } = album;
          let { artists: trackartists } = album;
          let { name: trackname } = track;
          let { id } = track;
          let { duration_ms } = track;
          let { popularity } = track;
          var timeseconds = duration_ms / 1000;
          var minutes = Math.floor(timeseconds / 60);
          var seconds = Math.floor(timeseconds % 60);
          var display = `${minutes}:${seconds}`;
          var displaytrack = { position: pos, titulo: trackname, popularidad: popularity, duracion: display, album_url: trackimages[2].url, trackartists: trackartists, trackid: id };

          array_tracks.push(displaytrack);
          pos = pos + 1;
        });


        resolve(array_tracks);


      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(tToken).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.fetchTopTracks(tToken,id))

            
          })
        }
      });



    });
  }
  removeTrack(trackid: string) {
    return new Promise<string>(async (resolve, reject) => {

      this.Spotifyapi.removeTrack(this.accessToken, trackid).subscribe((data) => {

        resolve(data);
      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(this.accessToken).subscribe(async (res:any)=>{

            
            let {token}=res;
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
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.saveTrack(trackid))

            
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
  getSearchedTracks = (token: any, searchQuery: string) => {
    return new Promise<string>((resolve, reject) => {
      this.Spotifyapi.searchTracks(token, searchQuery).subscribe((res) => {
        var list: any = [];

        let { data } = res;
        let { tracks } = data;



        let { items } = tracks;

        items.forEach((item: any) => {
          let { name: trackname } = item;
          let { duration_ms: duration } = item;
          let { artists } = item;
          let { album } = item;
          let { images } = album;
          let { id: trackid } = item;


          var artistinfo = artists.map(({ id, name }: { id: any, name: any }) => ({ id, name }));

          if (images[0] !== undefined) {
            var url = images[0].url;
          }
          else {
            url = "https://icon-library.com/images/music-icon/music-icon-2.jpg";
          }
          let trackJson = { artists: artistinfo, images: url, trackname: trackname, trackid: trackid, duration: duration }
          list.push(trackJson);


        });

        resolve(list);

      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(token).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.getSearchedTracks(token,searchQuery))

            
          })
        }
      });



    });
  }

  getSearchedArtists = (token: any, searchQuery: string) => {
    return new Promise<string>((resolve, reject) => {
      this.Spotifyapi.searchArtists(token, searchQuery).subscribe((res) => {
        var list: any = [];

        let { data } = res;
        let { artists } = data;
        let { items } = artists;

        items.forEach((item: any) => {
          let { name: artistName } = item;
          let { id: artistid } = item;
          let { images } = item;

          if (images[0] !== undefined) {

            var url = images[0].url;
          }
          else {
            url = "https://icon-library.com/images/music-icon/music-icon-2.jpg";
          }
          let artistJSON = { artistName: artistName, artistid: artistid, images: url }
          list.push(artistJSON)
        });



        resolve(list);
      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(token).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.getSearchedArtists(token,searchQuery))

            
          })
        }
      });



    });
  }
  getArtist(artistname: any) {
    var artistid2: any;


    this.songList.forEach((element: any) => {

      let { artists } = element;
      artists.forEach((artist: any) => {
        if (artist.name == artistname) {

          artistid2 = artist.id;
        }
      });



      const url = [`/dashboard/artista`, artistid2];


      this.router.navigate(url);

    });


  }
  getAlbum(albumname: any) {
    var albumid2: any;


    this.songList.forEach((element: any) => {
      let { albumname: album } = element;

      if (album == albumname) {
        let { albumid } = element;
        albumid2 = albumid;
      }


      const url = [`/dashboard/album`, albumid2];


      this.router.navigate(url);

    });


  }
  getArtistSection(artistid: any) {


    

    const url = [`/dashboard/artista/`, artistid];
    this.router.navigate(url);




  }
  getSearchedAlbums = (token: any, searchQuery: string) => {
    return new Promise<string>((resolve, reject) => {
      this.Spotifyapi.searchAlbum(token, searchQuery).subscribe((res) => {
        var list: any = [];
        let { data } = res;
        let { albums } = data;
        let { items } = albums;
        items.forEach((item: any) => {
          let { album_type } = item;
          let { images } = item;
          let { id: albumid } = item;
          let { name: albumname } = item;
          let { release_date } = item;
          release_date = release_date.split('-')[0];
          if (images[0] !== undefined) {

            var url = images[0].url;
          }
          else {
            url = "https://icon-library.com/images/music-icon/music-icon-2.jpg";
          }
          let albumJSON = { albumname: albumname, albumid: albumid, images: url, album_type: album_type, release_date: release_date }
          list.push(albumJSON);

        });

        resolve(list);


      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(token).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.getSearchedAlbums(token,searchQuery))

            
          })
        }
      });



    });
  }
  getSearchedPlaylists = (token: any, searchQuery: string) => {
    return new Promise<string>((resolve, reject) => {
      this.Spotifyapi.searchPlaylist(token, searchQuery).subscribe((res) => {
        var list: any = [];
        let { data } = res;
        let { playlists } = data;
        let { items } = playlists;
        items.forEach((playlist: any) => {
          let { description } = playlist;
          let { id: playlistid } = playlist;
          let { images } = playlist;
          let { name: playlistname } = playlist;
          var url;
          if (images[0] !== undefined) {

            url = images[0].url;
          }
          else {
            url = "https://icon-library.com/images/music-icon/music-icon-2.jpg";
          }


          let playlistJSON = { playlistname: playlistname, playlistid: playlistid, images: url, description: description }
          list.push(playlistJSON);
        });


        resolve(list);


      },(error)=>{
        if(error.status===401){
          this.Spotifyapi.refreshJwtToken(token).subscribe(async (res:any)=>{

            
            let {token}=res;
            this.store.dispatch(setJwtToken({ jwtToken: token }))
            resolve(await this.getSearchedPlaylists(token,searchQuery))
            
            
          })
        }
      });



    });
  }


  async getSong(songdata:any): Promise<void> {
    var trackname = songdata.trackname.replace(" ", "+");

    var artista = "";
    songdata.artists.forEach((artist:any) => {
      artista = artista + " " + artist.name;

    });

    artista = artista.replaceAll(" ", "+")
    this.toolbarService.setDisplayImage(songdata.images);
 
    this.toolbarService.setSongName(songdata.trackname);
    this.toolbarService.setSongArtists(songdata.artists);
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
  getAlbumSection(albumid: any) {


    this.router.navigate(['dashboard', 'album', albumid]);


  }
  getPlaylistSection(playlistid: any) {


    const url = [`/dashboard/playlist/`, playlistid];


    this.router.navigate(url);




  }
  async playArtistSongs(event: Event) {
    var artistSongsIDS: any = []
     for (const song of this.artistSongs){
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
  navigateToArtist(){

    var artistid=this.mainArtist[0].artistid;
    const url = [`/dashboard/artista/`, artistid];
    this.router.navigate(url)
  }
}

import { Component } from '@angular/core';
import { MatListItem } from '@angular/material/list';
import { ViewChild } from '@angular/core'
import { MatDrawer } from '@angular/material/sidenav';
import { SharedserviceService } from '../sharedservice.service';

import { Renderer2 } from '@angular/core';
import { SpotifyapiService } from '../spotifyapi.service';
import { Store, select } from '@ngrx/store';
import { selectJwtToken } from '../store/selectors/jwt-token.selectors';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CreateplaylistComponent } from '../createplaylist/createplaylist.component';
import { filter } from 'rxjs';
import { setJwtToken } from '../store/actions/jwt-token.actions';
@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  @ViewChild('drawer') public drawer!: MatDrawer;
  searchQuery: string = "";
  followedartist: any = [];
  userplaylists: any = [];
  userlikedtracks: any = [];
  userlikedalbums: any = [];
  access_token: any;
  filtervalue: any;
  filtereditems: any = []
  filteredflag: boolean = false;
  followedgroup: boolean = false;
  userplaylistgroup: boolean = false;
  useralbumsgroup: boolean = false;
  constructor(public toolbarService: SharedserviceService, private renderer: Renderer2, private Spotifyapi: SpotifyapiService, private store: Store, private router: Router, private matDialog: MatDialog) { }

  async ngAfterViewInit() {
    this.toolbarService.setDrawer(this.drawer);
    var tToken = await this.getToken();
    this.access_token = tToken;

    var user_id = await this.getCurrentUserID(tToken);

    // this.userplaylists=await this.Spotifyapi.getUserPlaylists(tToken,user_id).subscribe(playlist=>{("PLAYLIST"+JSON.stringify(playlist))});

    this.followedartist = await this.getFollowedArtists(tToken);
    this.userplaylists = await this.getUserPlaylists(tToken, user_id);
    this.userlikedalbums = await this.checkLikedAlbums(tToken);


    // ("userplaylist"+JSON.stringify(this.userplaylists));

  }

  toggleDrawer() {

    this.toolbarService.toggle();
    this.toolbarService.minisidenavhidden = false;

  }
  enviarInicio() {
    this.router.navigate(['dashboard/inicio'])

  }
  handleSearch(searchQuery: string) {
    this.searchQuery = searchQuery;
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

      var artistsreturned: any = [];
      this.Spotifyapi.getFollowedartists(token).subscribe((res) => {
        let { data } = res;
        let { artists } = data;

        let { items } = artists;

        items.forEach((item: any) => {
          let { name: artistName } = item;
          let { images: artistImages } = item;
          let { id: artistid } = item;
          var url = "";
          if (artistImages[0] !== undefined) {
            url = artistImages[0].url;
          }
          else {
            url = "https://icon-library.com/images/saxophone-icon/saxophone-icon-9.jpg";
          }
          let artist = {
            artistName: artistName, artistImages: url, type: "Artista", artistid: artistid
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
          if (Array.isArray(playlistImages) && playlistImages.length === 0) {
            // URL is represented as [], do something here
            playlistImages.push({ url: "https://cdn.icon-icons.com/icons2/2024/PNG/512/music_playlist_icon_123837.png" })
          }
          let playlist = {
            playlistName: playlistName, playlistImages: playlistImages[0].url, username: username, type: "Lista", playlistid: playlistid
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
        let { data } = res;

        ("Data" + JSON.stringify(data));




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
  enviarLikedSongs() {
    this.router.navigate(['/dashboard/userlikedsongs'])
  }
  getArtist(artistname: any) {
    var artistid2: any;

    this.followedartist.forEach((element: any) => {

      let { artistName: artista } = element;
      if (artista == artistname) {
        let { artistid } = element;
        artistid2 = artistid;
      }
      ;


    });
    const url = [`/dashboard/artista`, artistid2];


    this.router.navigate(url)

  }
  getPlaylist(playlistid: any) {



    const url = [`/dashboard/playlist`, playlistid];


    this.router.navigate(url)

  }
  createPlaylist() {

    this.matDialog.open(CreateplaylistComponent, {
      width: '350px',
    })
  }
  enviarBusqueda() {
    this.router.navigate(['/dashboard/search']);
  }
  filterSearchSidenav() {

    this.filtereditems = []
    var isEmptyString = this.filtervalue;
    if (isEmptyString != '') {
      this.followedartist.forEach((artist: any) => {

        var filtereditem = {
          Name: artist.artistName,
          Images: artist.artistImages,
          id: artist.artistid,
          type: artist.type
        }

        if (filtereditem.Name.toLowerCase().includes(this.filtervalue.toLowerCase())) {
          this.filtereditems.push(filtereditem);
        }

      })
      this.userplaylists.forEach((playlist: any) => {

        var filtereditem = {
          Name: playlist.playlistName,
          Images: playlist.playlistImages,
          id: playlist.playlistid,
          type: playlist.username
        }

        if (filtereditem.Name.toLowerCase().includes(this.filtervalue.toLowerCase())) {
          this.filtereditems.push(filtereditem);
        }
      })

      this.userlikedalbums.forEach((album: any) => {

        var filtereditem = {
          Name: album.albumName,
          Images: album.albumImages,
          id: album.albumID,
          type: album.type
        }

        if (filtereditem.Name.toLowerCase().includes(this.filtervalue.toLowerCase())) {
          this.filtereditems.push(filtereditem);
        }
      })
      this.filteredflag = true;
    }
    else{
      this.filteredflag = false;
    }

  }

  checkLikedAlbums(tToken:any) {
    return new Promise<boolean>(async (resolve, reject) => {
      var albumsreturned: any = [];
      this.Spotifyapi.getUserSavedAlbums(tToken).subscribe((res) => {

        let { data } = res;


        let { items } = data;
        items.forEach((item: any) => {
          let { album } = item;
          let { name: albumName } = album;
          let { images: albumImages } = album;
          let { id: albumID } = album;
          let { album_type: type } = album;
          let { artists: Albumartists } = album;
          var album_artists = "";
          Albumartists.forEach((artist: any) => {
            album_artists = album_artists + artist.name;

          })
          let albumobject = {
            albumName: albumName,
            albumImages: albumImages[0].url,
            albumID: albumID,
            type: type,
            album_artists: album_artists
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
  getFiltered(item: any) {

    var type = item.type;
    var url;
    if (type == "album") {
      url = [`/dashboard/album`, item.id];
    }
    else if (type == "Artista") {
      url = [`/dashboard/artista`, item.id];
    }
    else {
      url = [`/dashboard/playlist`, item.id];

    }




    this.router.navigate(url)

  }
  groupArtists() {
    this.followedgroup = true;
  }
  groupAlbums() {
    this.useralbumsgroup = true;
  }
  groupPlaylists() {
    this.userplaylistgroup = true;
  }
  removeGroups() {
    if (this.followedgroup == true) {
      this.followedgroup = false;
    }
    if (this.useralbumsgroup == true) {
      this.useralbumsgroup = false;
    }
    if (this.userplaylistgroup == true) {
      this.userplaylistgroup = false;
    }
  }

}

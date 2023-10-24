import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError} from 'rxjs';
import { HttpClientService } from './http-client.service';
import { youtube } from 'googleapis/build/src/apis/youtube';
import { healthcare } from 'googleapis/build/src/apis/healthcare';
@Injectable({
  providedIn: 'root'
})

export class SpotifyapiService {
  
  private _access_token!: any;
  public get access_token(): any {
    return this._access_token;
  }
  public set access_token(value: any) {
    this._access_token = value;
  }
  constructor(private http:HttpClientService ) { }
  getAccessToken(code:any): Observable<any> {
    const baseurl: string='http://localhost:3001/auth';

    let data = {
      code:code,
      
    }
    const hea = {
      
      'Content-Type':'application/x-www-form-urlencoded'
    }
    
   
    let body = new HttpParams()
    .set('code',data.code??'')

   return this.http.post(baseurl,body,hea);
  }
 
  getSeveralTracks(access_token:any): Observable<any> {
    const baseurl: string='http://localhost:3001/several-tracks';
   
  

    const hea = {
      
      'Authorization': `Bearer ${access_token}`, 
    }
    

    let body = new HttpParams()
  

  
    return this.http.post(baseurl,body,hea);
  }
  getArtist(access_token:any, id:any): Observable<any> {
    const baseurl: string='http://localhost:3001/get-artist';
   
    let data = {
     id:id,
      
    }

    const hea = {
      'Authorization': `Bearer ${access_token}`, 
     
    }


    let body = new HttpParams()
    
    .set('id',data.id??'')

  
    return this.http.post(baseurl,body,hea);
  }
  getTopTracks(access_token:any, id:any): Observable<any> {
    const baseurl: string='http://localhost:3001/get-toptracks';
   
    let data = {
     id:id,
      
    }

    const hea = {
      
      'Authorization': `Bearer ${access_token}`, 
    }


    let body = new HttpParams()
    .set('id',data.id??'')

  
    return this.http.post(baseurl,body,hea);
  }
  getTracks(access_token:any, id:any): Observable<any> {
    const baseurl: string='http://localhost:3001/get-tracks';
   
    let data = {
     access_token:access_token,id:id,market:"ES",
      
    }

    const hea = {
      
     
    }
    

    let body = new HttpParams()
    .set('access_token',data.access_token??'')
    .set('id',data.id??'')
    

  
    return this.http.post(baseurl,body,hea);
  }
  getAlbums(access_token:any, id:any): Observable<any> {
    const baseurl: string='http://localhost:3001/get-albums';
   
    let data = {
     access_token:access_token,id:id
      
    }

    const hea = {
      
     
    }
    

    let body = new HttpParams()
    .set('access_token',data.access_token??'')
    .set('id',data.id??'')
    

  
    return this.http.post(baseurl,body,hea);
  }
  getUserTopTracks(access_token:any): Observable<any> {
    const baseurl: string='http://localhost:3001/get-usertoptracks';
   
    let data = {
     access_token:access_token,type:"tracks"
      
    }

    const hea = {
      
     
    }
    

    let body = new HttpParams()
    .set('access_token',data.access_token??'')
    .set('type',data.type??'')
    

  
    return this.http.post(baseurl,body,hea);
  }
  getUserTopArtists(access_token:any): Observable<any> {
    const baseurl: string='http://localhost:3001/get-usertopartists';
   
    let data = {
     access_token:access_token,type:"artists"
      
    }

    const hea = {
      
     
    }
    

    let body = new HttpParams()
    .set('access_token',data.access_token??'')
    .set('type',data.type??'')
    

  
    return this.http.post(baseurl,body,hea);
  }
  getRecentlyPlayed(access_token:any): Observable<any> {
    const baseurl: string='http://localhost:3001/get-recentlyplayed';
   
    let data = {
     access_token:access_token
      
    }

    const hea = {
      
     
    }
    

    let body = new HttpParams()
    .set('access_token',data.access_token??'')

    

  
    return this.http.post(baseurl,body,hea);
  }
  getSongID(youtubeKey:string,queryString:string): Observable<any> {
    const baseurl: string = `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${youtubeKey}&q=${queryString}&type=video`;
   
    const headers = new HttpHeaders();
    return this.http.get(baseurl,headers);
  }
  getAlbum(access_token: any, id: any):Observable<any> {
    const baseurl: string='http://localhost:3001/get-album';
    
    let data = {
      id:id,
       
     }
     let body = new HttpParams()
     .set('id',data.id??'')
     
 
    const headers = {'Authorization': `Bearer ${access_token}`, }
    return this.http.post(baseurl,body,headers);
  }
  searchTracks(access_token: any, queryString: any):Observable<any> {
    const baseurl: string='http://localhost:3001/search-tracks';
    
    let data = {
      queryString:queryString,
       
     }
     let body = new HttpParams()
   
     .set('queryString',data.queryString??'')
     
 
    const headers ={'Authorization': `Bearer ${access_token}`, }
    return this.http.post(baseurl,body,headers);
  }
  searchArtists(access_token: any, queryString: any):Observable<any> {
    const baseurl: string='http://localhost:3001/search-artists';
    
    let data = {
     queryString:queryString,
       
     }
     let body = new HttpParams()

     .set('queryString',data.queryString??'')
     
 
    const headers = {'Authorization': `Bearer ${access_token}`, }
    return this.http.post(baseurl,body,headers);
  }
  searchAlbum(access_token: any, queryString: any):Observable<any> {
    const baseurl: string='http://localhost:3001/search-album';
    
    let data = {
      access_token:access_token,queryString:queryString,
       
     }
     let body = new HttpParams()
     .set('queryString',data.queryString??'')
     
 
    const headers = {'Authorization': `Bearer ${access_token}`, }
    return this.http.post(baseurl,body,headers);
  }
  searchPlaylist(access_token: any, queryString: any):Observable<any> {
    const baseurl: string='http://localhost:3001/search-playlist';
    
    let data = {
      access_token:access_token,queryString:queryString,
       
     }
     let body = new HttpParams()
     .set('queryString',data.queryString??'')
     
 
    const headers = {'Authorization': `Bearer ${access_token}`, }
    return this.http.post(baseurl,body,headers);
  }
  getFollowedartists(access_token: any):Observable<any> {
    const baseurl: string='http://localhost:3001/get-followedartist';
   
   
    const headers ={
      'Authorization': `Bearer ${access_token}`, 
    };
    
    return this.http.post(baseurl,{},headers);
  }
  followArtist(access_token: any,artistid:any):Observable<any> {
    const baseurl: string='http://localhost:3001/followartist';
    
     
    let data = {
      artistid:artistid,
      
    }
    let body = new HttpParams()
    .set('artistid',data.artistid??'')
 
    const headers ={
      'Authorization': `Bearer ${access_token}`, 
    };
    
    return this.http.post(baseurl,body,headers);
  }
  unfollowArtist(access_token: any,artistid:any):Observable<any> {
    const baseurl: string='http://localhost:3001/unfollowartist';
    
     
    let data = {
      artistid:artistid,
      
    }
    let body = new HttpParams()
    .set('artistid',data.artistid??'')
 
    const headers ={
      'Authorization': `Bearer ${access_token}`, 
    };
    
    return this.http.post(baseurl,body,headers);
  }
  getUserPlaylists(access_token: any, user_id: any):Observable<any> {
    const baseurl: string='http://localhost:3001/get-userplaylists';
    
    let data = {
       user_id:user_id,
       
     }
     let body = new HttpParams()
     .set('user_id',data.user_id??'')
    
    const headers = {
      'Authorization': `Bearer ${access_token}`, 
    }
    
    return this.http.post(baseurl,body,headers);
  }
  getUserSavedTracks(access_token: any):Observable<any> {
    const baseurl: string='http://localhost:3001/get-usersavedtracks';
    
   
  
     
 
    const headers = {'Authorization': `Bearer ${access_token}`, }
    return this.http.post(baseurl,{},headers);
  }
  getCurrentUserProfile(access_token: any):Observable<any> {
    const baseurl: string='http://localhost:3001/get-currentuserprofile';
    
    
    const headers = {
      'Authorization': `Bearer ${access_token}`, 
    };
    return this.http.post(baseurl,{},headers);
  }
  getPlaylistbyid(access_token: any, playlist_id: any):Observable<any> {
    const baseurl: string='http://localhost:3001/get-playlistbyid';
    
    let data = {
       playlist_id:playlist_id,
       
     }
     let body = new HttpParams()
     .set('playlist_id',data.playlist_id??'')
    
    const headers = {'Authorization': `Bearer ${access_token}`, }
    return this.http.post(baseurl,body,headers);
  }
  saveTrack(access_token: any, trackid: any):Observable<any> {
    const baseurl: string='http://localhost:3001/saveTrack';
   
    let data = {
    trackid:trackid,
       
     }
     let body = new HttpParams()
 
     .set('trackid',data.trackid??'')
 
     const headers = {'Authorization': `Bearer ${access_token}`, }
    return this.http.post(baseurl,body,headers);
  }
  checkSavedTrack(access_token: any, trackid: any):Observable<any> {
    const baseurl: string='http://localhost:3001/checkSavedTrack';
   
    let data = {
       trackid:trackid,
       
     }
     let body = new HttpParams()
     
     .set('trackid',data.trackid??'')
    
    const headers = {'Authorization': `Bearer ${access_token}`, }
    return this.http.post(baseurl,body,headers);
  }
  addTrackToPlaylist(access_token: any,playlistid:any, trackid: any):Observable<any> {
    const baseurl: string='http://localhost:3001/addTrackToPlaylist';
   
    let data = {
       playlistid:playlistid, trackid:trackid,
       
     }
     let body = new HttpParams()
 
     .set('playlistid',data.playlistid??'')
     .set('trackid',data.trackid??'')
    const headers = {'Authorization': `Bearer ${access_token}`, }
    return this.http.post(baseurl,body,headers);
  }
  removeTrackToPlaylist(access_token: any,playlistid:any, trackid: any,snapshotid:string):Observable<any> {
    const baseurl: string='http://localhost:3001/removeTrackToPlaylist';
   
    let data = {
      access_token:access_token, playlistid:playlistid, trackid:trackid,snapshotid:snapshotid
       
     }
     let body = new HttpParams()
     .set('access_token',data.access_token??'')
     .set('playlistid',data.playlistid??'')
     .set('trackid',data.trackid??'')
     .set('snapshotID',data.snapshotid??'')
    const headers = new HttpHeaders();
    return this.http.post(baseurl,body,headers);
  }
  createPlaylist(access_token: any,user_id:any,name: any,description:any,publicbool:any):Observable<any> {
    const baseurl: string='http://localhost:3001/createPlaylist';
   
    let data = {
      access_token:access_token, user_id:user_id, name:name, description:description, publicbool:publicbool
       
     }
    

    const headers = new HttpHeaders();
    return this.http.post(baseurl,data,headers);
  }
  removeTrack(access_token: any, trackid: any):Observable<any> {
    const baseurl: string='http://localhost:3001/removeTrack';
   
    let data = {
      trackid:trackid,
       
     }
     let body = new HttpParams()
     .set('trackid',data.trackid??'')
    
     const headers = {'Authorization': `Bearer ${access_token}`, }
    return this.http.post(baseurl,body,headers);
  }
  getRefreshToken(refreshToken:any,access_token:any): Observable<any> {
    const baseurl: string='http://localhost:3001/refreshToken';

    let data = {
      refreshToken:refreshToken,
      
    }
    const hea = {
      
      'Content-Type':'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${access_token}`, 
    }
    
   
    let body = new HttpParams()
    .set('refreshToken',data.refreshToken??'')

   return this.http.post(baseurl,body,hea);
  }
  refreshJwtToken(jwtToken:any): Observable<any> {
    const baseurl: string='http://localhost:3001/refreshjwtToken';
    
    const data={
        jwtToken:jwtToken
    }
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    
    };
  
    let body = new HttpParams()
    .set('jwtToken',data.jwtToken??'')


   return this.http.post(baseurl,body,headers);
  }
  checkFollowedArtist(access_token: any, artistid: any):Observable<any> {
    const baseurl: string='http://localhost:3001/checkFollowedArtist';
   
    let data = {
       artistid:artistid,
       
     }
     let body = new HttpParams()
     
     .set('artistid',data.artistid??'')
    
    const headers = {'Authorization': `Bearer ${access_token}`, }
    return this.http.post(baseurl,body,headers);
  }
  getUserSavedAlbums(access_token: any):Observable<any> {
    const baseurl: string='http://localhost:3001/get-usersavedalbums';
    
   
  
     
 
    const headers = {'Authorization': `Bearer ${access_token}`, }
    return this.http.post(baseurl,{},headers);
  }
  saveAlbum(access_token: any, albumid: any):Observable<any> {
    const baseurl: string='http://localhost:3001/saveAlbum';
   
    let data = {
    albumid:albumid,
       
     }
     let body = new HttpParams()
 
     .set('albumid',data.albumid??'')
 
     const headers = {'Authorization': `Bearer ${access_token}`, }
    return this.http.post(baseurl,body,headers);
  }
  removeAlbum(access_token: any, albumid: any):Observable<any> {
    const baseurl: string='http://localhost:3001/removeAlbum';
   
    let data = {
      albumid:albumid,
       
     }
     let body = new HttpParams()
     .set('albumid',data.albumid??'')
    
     const headers = {'Authorization': `Bearer ${access_token}`, }
    return this.http.post(baseurl,body,headers);
  }

  checkSavedAlbum(access_token: any, albumid: any):Observable<any> {
    const baseurl: string='http://localhost:3001/checkSavedAlbum';
   
    let data = {
       albumid:albumid,
       
     }
     let body = new HttpParams()
     
     .set('albumid',data.albumid??'')
    
    const headers = {'Authorization': `Bearer ${access_token}`, }
    return this.http.post(baseurl,body,headers);
  }
  getFeaturedPlaylist(access_token: any):Observable<any> {
    const baseurl: string='http://localhost:3001/get-FeaturedPlaylists';
   
    let data = {
     
       
     }
     let body = new HttpParams()
     

    
    const headers = {'Authorization': `Bearer ${access_token}`, }
 
    return this.http.post(baseurl,body,headers);
  }
  getSongRecommendations(access_token: any,trackid:any):Observable<any> {
    const baseurl: string='http://localhost:3001/get-SongRecommendations';
   
    let data = {
      trackid: trackid,
       
     }
     let body = new HttpParams()
     

     .set('trackid',data.trackid??'')
    const headers = {'Authorization': `Bearer ${access_token}`, }
 
    return this.http.post(baseurl,body,headers);
  }
  getArtistRecommendations(access_token: any,artistid:any):Observable<any> {
    const baseurl: string='http://localhost:3001/get-ArtistRecommendations';
   
    let data = {
      artistid: artistid,
       
     }
     let body = new HttpParams()
     

     .set('artistid',data.artistid??'')
    const headers = {'Authorization': `Bearer ${access_token}`, }
 
    return this.http.post(baseurl,body,headers);
  }


  
}

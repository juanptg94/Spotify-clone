import { Component, Input, OnInit } from '@angular/core';
import { SharedserviceService } from '../sharedservice.service';
import { number } from 'prop-types';

declare global {
  interface Window {

    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: any;
      PlayerState: any;
    };
  }
}

@Component({
  selector: 'app-youtube-player',
  templateUrl: './youtube-player.component.html',
  styleUrls: ['./youtube-player.component.scss']
})
export class YoutubePlayerComponent implements OnInit {

  done = false;
  player: any;
  @Input() SONGID: any = [];
  pausedTimeStamp: any;
 currentIndex = 0;
 SongIDS:any=[]
 intervalCurrent: NodeJS.Timeout | undefined = undefined;
  constructor(private toolbarservice: SharedserviceService) { }

  ngOnInit(): void {
    window.onYouTubeIframeAPIReady = () => {
      this.onYouTubeIframeAPIReady();
    };

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
    var firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  }

  onYouTubeIframeAPIReady(): void {
    var playlist = this.SONGID;
    
      this.player = new window.YT.Player('player', {
        height: '280',
        width: '500',
        videoId: this.SONGID,
        playerVars: {
          'playsinline': 1,
        },
        events: {
          'onReady': this.onPlayerReady.bind(this),
          'onStateChange': this.onPlayerStateChange.bind(this)
        }
      });
 
   
   
  }

  onPlayerReady(event: any): void {
    if (this.player) {
      event.target.playVideo();
    }


  }

  onPlayerStateChange(event: any): void {
    if (event.data == window.YT.PlayerState.PLAYING ) {


    
      this.toolbarservice.activateAnimation();
       this.toolbarservice.isNotPlayingIcon();
    }
    else if (event.data == window.YT.PlayerState.BUFFERING) {
      this.waitForDuration()
      this.getCurrentTime();
    }
   
    else{
      this.toolbarservice.desactivateAnimation();
      this.toolbarservice.isPlayingIcon();
      this.currentIndex = event.target.getPlaylistIndex();
      clearInterval(this.intervalCurrent);
     
    }
  }
  waitForDuration() {
    var duration = this.player.getDuration();

    // Do something with the video ID while buffering.
    const checkInterval = 500;
    let intervalId: NodeJS.Timeout | null = null;
    const checkDuration = () => {
      var duration = this.player.getDuration();
      if (duration > 0) {


        this.toolbarservice.setSongLength(duration);
        // Do something with the duration while buffering.
        clearInterval(intervalId!); // Stop the interval once duration is available
      }
    }
    intervalId = setInterval(checkDuration, checkInterval);
  }
  prevButton(){
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.player.loadPlaylist(this.SongIDS, this.currentIndex, 0);
    }
  }
  nextButton(){
    if (this.currentIndex < this.SongIDS.length - 1) {
      this.currentIndex++;
      this.player.loadPlaylist(this.SongIDS, this.currentIndex, 0);
    }
  }
  stopVideo(): void {
    if (this.player) {
      this.pausedTimeStamp = this.player.getCurrentTime();
      this.player.stopVideo();
    }

  }
  setVolume(volume: number): void {
    if (this.player) {
      this.player.setVolume(volume);
    }
  }
  playVideoFromTimeStamp() {

    if (this.player) {

      this.player.loadVideoById(this.SONGID, this.pausedTimeStamp);


    }

  }
  getVolume(): any {
    if (this.player) {
      return this.player.getVolume();
    }
  }
  getSongLength() {
    if (this.player) {
      return this.player.getDuration();
    }
    return 0;
  }
  updateVideo(SongIDS:any[]) {
    this.SongIDS=SongIDS;
    if (this.player) {
      // Destroy the existing player
      
      this.player.destroy();
   
    }
    var playlist:any ;
    playlist = SongIDS.join(',');
    this.player = new window.YT.Player('player', {
      height: '280',
      width: '500',
    
      playerVars: {
        'playsinline': 1,
        'playlist':playlist,
       
      },
      events: {
        'onReady': this.onPlayerReady.bind(this),
        'onStateChange': this.onPlayerStateChange.bind(this)
      }
    });
    
   


  }
  getCurrentTime(): number {
    if (this.player && this.player!==undefined) {
      const checkInterval = 950;
     
      
   
      const checkCurrentTime = () => {
      
        var currenttime = this.player.getCurrentTime();
   
        
        this.toolbarservice.setCurrentTime(currenttime);
      }
      this.intervalCurrent = setInterval(checkCurrentTime, checkInterval);
    }
    return 0;
  }
  playVideoFromGivenTime(given_time: number) {

    if (this.player) {

      this.player.loadVideoById(this.SONGID, given_time);



    }

  }
  destroy() {
    if (this.player) {
      this.player.destroy();
      this.player = null;

    }
  }
}
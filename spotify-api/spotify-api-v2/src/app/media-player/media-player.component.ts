import { Component, Renderer2 ,ElementRef} from '@angular/core';
import { SharedserviceService } from '../sharedservice.service';

@Component({
  selector: 'app-media-player',
  templateUrl: './media-player.component.html',
  styleUrls: ['./media-player.component.scss']
})
export class MediaPlayerComponent {



  currentVolumeValue: number = this.toolbarservice.getVolume();
  songName: string = "";
  songArtists: any = [];
  songLength: any = "";
  currentTime: any = "";
  constructor(private toolbarservice: SharedserviceService,private renderer: Renderer2,private el: ElementRef) { }
  isPlaying: boolean = false;
  playingSwitch: boolean = false;
  displayImage: any;
  barTime: number = 0;
  barLength: number = 0;

  onVolumeSliderChange(event: any) {

    this.toolbarservice.setVolume(event.target.value);
    // You can perform any other actions you want with the new value
  }
  togglePlay() {
    
    if (this.playingSwitch == false) {
      
      this.toolbarservice.stopVideo();
      
    }
    else {
      
      this.toolbarservice.playVideoFromTimeStamp();
    
     
    }
    this.playingSwitch=!this.playingSwitch;
   
    
    
  }
  isPlayingIcon(){
    this.isPlaying=false;
  }
  isNotPlayingIcon(){
    this.isPlaying=true;

  }
  activateAnimation() {
    const waveElements=this.el.nativeElement.querySelectorAll('.wave .wave1')
   
      Array.from(waveElements).forEach((element: any) => {
        this.renderer.addClass(element, 'active2');
       
      });
      
      
    
  }
  desactivateAnimation(){
    const waveElements=this.el.nativeElement.querySelectorAll('.wave .wave1')
   
      Array.from(waveElements).forEach((element: any) => {
        this.renderer.removeClass(element, 'active2');
       
      });
      
  }
  setDisplayImage(displayImage: string) {
    this.displayImage = displayImage;
  }
  setSongName(songName: string) {
    this.songName = songName;
  }
  setSongArtist(songArtists: any) {
    var artistNamesList: any = [];
    songArtists.forEach((songArtist: any) => {
      let { name } = songArtist;
      artistNamesList.push(name);
    });
    this.songArtists = artistNamesList;

  }
  setSongLength(arg0: any) {
    this.barLength = arg0;
    var minutes = Math.floor(arg0 / 60);
    var seconds = Math.floor(arg0 % 60);
    arg0 = `${minutes}:${seconds}`;
    this.songLength = arg0;
  }
  getCurrentTime(): number {
    return this.toolbarservice.getCurrentTime();
  }
  getSongLength(): any {
    return this.songLength;
  }
  setCurrentTime(time: number) {
    this.barTime = time;
    const roundedValue = Math.round(time);
    const minutes = Math.floor(roundedValue / 60);
    const seconds = Math.floor(roundedValue % 60);
    var bartime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    this.currentTime = bartime;
  }
  calculateDotPosition(): number {
    return (this.barTime / this.barLength) * 100;
  }
  
  onBarSliderChange(event: any) {

    this.toolbarservice.playVideoFromGivenTime(event.target.value);
    // You can perform any other actions you want with the new value
  }
  prevButton(){
    this.toolbarservice.prevButton();
  }
  nextButton(){
    this.toolbarservice.nextButton();
  }
}

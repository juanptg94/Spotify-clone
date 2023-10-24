import { Injectable, Input } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { YoutubePlayerComponent } from './youtube-player/youtube-player.component';
import { Subject } from 'rxjs';
import { MediaPlayerComponent } from './media-player/media-player.component';

@Injectable({
  providedIn: 'root'
})
export class SharedserviceService {
  
  private drawer!: MatDrawer;
  private _minisidenavhidden: Boolean = false;

  private player!:YoutubePlayerComponent
  private searchBar!:HTMLInputElement;
  private searchTerm!:String;
  private snapshotID!:String;
  private eventSubject = new Subject<any>();
  private mediaplayer!:MediaPlayerComponent
  private currentTimeSubject = new Subject<number>();
  currentTime$ = this.currentTimeSubject.asObservable();

  updateCurrentTime(time: number) {
    this.currentTimeSubject.next(time);
  }
  setSearchTerm(searchTerm:String) {
    this.searchTerm = searchTerm;
  }
  getSearchTerm():String {
    return this.searchTerm;
  }

  setSearchBar(searchBar: HTMLInputElement) {
    this.searchBar = searchBar;
  }

  
  public get minisidenavhidden(): Boolean {
    return this._minisidenavhidden;
  }
  public set minisidenavhidden(value: Boolean) {
    this._minisidenavhidden = value;
  }
  constructor() {  }
  setDrawer(drawer: MatDrawer) {
    this.drawer = drawer;
  }

  toggle(): void {
    this.drawer.toggle();
    
  }
  setPlayer(player:YoutubePlayerComponent) {
    this.player=player;
  }
  getPlayer(): YoutubePlayerComponent {
    return this.player;
  }
   updateVideo(SongID:any[]): void {
    if(this.player){
      this.player.updateVideo(SongID);
     
    }
    else{
      console.log("No hay reproductor")
    }
    

    
  }
  prevButton(): void {
    if(this.player){
      this.player.prevButton();
     
    }
    else{
      console.log("No se pudo atrasar")
    }
    

  }
  nextButton(): void {
    if(this.player){
      this.player.nextButton();
     
    }
    else{
      console.log("No se pudo adelantar")
    }
    

  }
  emitEvent(data: any) {
    this.eventSubject.next(data);
  }
  get eventEmitter() {
    return this.eventSubject.asObservable();
  }
 
  stopVideo(){
    this.player.stopVideo();
  }
  setVolume(volume: number): void {
    if(this.player){
      this.player.setVolume(volume);
    }
    else{
      console.log("No hay reproductor")
    }
   
  }
  getVolume():any{
    if(this.player){
      return this.player.getVolume();
    }
  
  }
  playVideoFromTimeStamp(){
    if(this.player){
      this.player.playVideoFromTimeStamp();
    }

  }
  setMediaplayer(mediaplayer:MediaPlayerComponent){
    this.mediaplayer=mediaplayer;
  }
  setDisplayImage(displayImage:string){
  
    this.mediaplayer.setDisplayImage(displayImage);
  }
  setSongName(songName:string) {

    this.mediaplayer.setSongName(songName);
  }
  setSongArtists(songArtists:any) {

    this.mediaplayer.setSongArtist(songArtists);
  }
  setSongLength(duration:string){
    this.mediaplayer.setSongLength(duration);
  }
  getCurrentTime():number{
    return this.player.getCurrentTime();
  }
  setCurrentTime(time:number){
     this.mediaplayer.setCurrentTime(time);
  }
  playVideoFromGivenTime(given_time:number) {

    if (this.player) {
   

      this.player.playVideoFromGivenTime(given_time);
     


    }

  }
  setSnapshotID(snapshotid:String) {
    this.snapshotID = snapshotid;
  }
  getSnapshotID():String {
    return this.snapshotID;
  }
  activateAnimation(){
    this.mediaplayer.activateAnimation();
  }
  desactivateAnimation(){
    
      this.mediaplayer.desactivateAnimation();
    
  }
 
  isPlayingIcon(){
    this.mediaplayer.isPlayingIcon();
  }
  isNotPlayingIcon(){
    this.mediaplayer.isNotPlayingIcon();
  }
}

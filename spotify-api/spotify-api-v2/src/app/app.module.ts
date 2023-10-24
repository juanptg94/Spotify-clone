import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { LayoutModule } from '@angular/cdk/layout';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { LoginComponent } from './login/login.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { MediaPlayerComponent } from './media-player/media-player.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PlantillaComponent } from './plantilla/plantilla.component';
import { InicioComponent } from './inicio/inicio.component';
import { ArtistaComponent } from './artista/artista.component';
import { MatTableModule } from '@angular/material/table';
import { MinisidenavComponent } from './minisidenav/minisidenav.component';
import { AlbumComponent } from './album/album.component';
import { YoutubePlayerComponent } from './youtube-player/youtube-player.component';
import { SearchpageComponent } from './searchpage/searchpage.component'; import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { JwtTokenReducer } from './store/reducers/jwt-token.reducer';
import { ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { localStorageSync } from 'ngrx-store-localstorage';
import { EffectsModule } from '@ngrx/effects';
import { JwtTokenEffects } from './store/effects/jwt-token.effects';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LikedsongsComponent } from './likedsongs/likedsongs.component';
import { PlaylistComponent } from './playlist/playlist.component';

import { MatDialogModule } from '@angular/material/dialog';
import { CreateplaylistComponent } from './createplaylist/createplaylist.component';
import { PlaylistmenuComponent } from './playlistmenu/playlistmenu.component';
import { UserprofileComponent } from './userprofile/userprofile.component';
import { RouteReuseStrategy, RouterModule } from '@angular/router';

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({ keys: ['accessToken'] })(reducer);
}

const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];




@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ToolbarComponent,
    SidenavComponent,
    MediaPlayerComponent,
    DashboardComponent,
    PlantillaComponent,
    InicioComponent,
    ArtistaComponent,
    MinisidenavComponent,
    AlbumComponent,
    YoutubePlayerComponent,
    SearchpageComponent,
    LikedsongsComponent,
    PlaylistComponent,
 
    CreateplaylistComponent,
    PlaylistmenuComponent,
    UserprofileComponent,


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,

    HttpClientModule,
    MatCardModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatTableModule, MatFormFieldModule,
    MatInputModule,
    FormsModule,
    StoreModule.forRoot({ jwtToken: JwtTokenReducer }),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
    EffectsModule.forRoot([JwtTokenEffects]),
    MatTooltipModule,
    MatDialogModule,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

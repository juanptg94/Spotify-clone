import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InicioComponent } from './inicio/inicio.component';
import { ArtistaComponent } from './artista/artista.component';
import { AlbumComponent } from './album/album.component';
import { SearchpageComponent } from './searchpage/searchpage.component';
import { LikedsongsComponent } from './likedsongs/likedsongs.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { UserprofileComponent } from './userprofile/userprofile.component';

const routes: Routes = [

  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login', component: LoginComponent
  },
  {
    path: 'dashboard', component: DashboardComponent,

    children: [{
      path: 'inicio', component: InicioComponent
    },{
      path: 'artista/:id', component: ArtistaComponent
    },
    {
      path: 'album/:id', component: AlbumComponent 
    },
    {
      path: 'search', component: SearchpageComponent  
    },
    {
      path: 'userlikedsongs', component: LikedsongsComponent  
    },
    {
      path: 'playlist/:id', component: PlaylistComponent 
    },
    {
      path: 'userprofile', component: UserprofileComponent
    },



    ]
  }

 
];
@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }


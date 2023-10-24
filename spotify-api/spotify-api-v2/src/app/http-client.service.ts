import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Xliff } from '@angular/compiler';
import * as qs from 'qs'

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {

  constructor(private http: HttpClient) {

  }

  post(baseurl:any, body:any, headers:any): Observable<any> {
 
 
    return this.http.post(baseurl, body, { 'headers': headers })
  }
  get(baseurl:any, headers:any): Observable<any> {
 

    return this.http.get(baseurl, { 'headers': headers })
  }
  




}

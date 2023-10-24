import { createFeatureSelector, createSelector } from "@ngrx/store";
import { JwtTokenReducer, JwtTokenState } from "../reducers/jwt-token.reducer";

const featureSelector=createFeatureSelector<JwtTokenState>('jwtToken');

export const selectJwtToken= createSelector(
  featureSelector,
  (JwtTokenReducer:JwtTokenState)=>{
    return JwtTokenReducer.jwtToken;
  }  
);
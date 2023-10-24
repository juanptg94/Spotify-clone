import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { getJwtToken, setJwtToken } from '../actions/jwt-token.actions';

export interface JwtTokenState {
    jwtToken: string | null;
}

export const initialState: JwtTokenState = {
    jwtToken: null,
};

export const JwtTokenReducer = createReducer(
    initialState,
    on(setJwtToken, (state, { jwtToken }) => {
        return {
            ...state,
            jwtToken: jwtToken,
        }
    }),
    on(getJwtToken, (state) => {
        return {
            ...state
        }
    })
);




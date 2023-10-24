import {createAction,props} from '@ngrx/store';

export const setJwtToken = createAction(
    '[JWT Token] set JWT Token',
    props<{jwtToken:string}>()
);
export const getJwtToken = createAction(
    '[JWT Token] get JWT Token',    
);
 
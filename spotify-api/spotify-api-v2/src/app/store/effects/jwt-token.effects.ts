import { Injectable } from "@angular/core";
import { Actions, createEffect } from "@ngrx/effects";

import { ofType } from "@ngrx/effects";
import { map, of, switchMap } from "rxjs";
import { getJwtToken,setJwtToken } from "../actions/jwt-token.actions";

@Injectable()

export class JwtTokenEffects {
    constructor(private actions$: Actions) { }

    setJwtToken$ = createEffect(() =>
        this.actions$.pipe(
            ofType(setJwtToken),
            map((action: any) => action.jwtToken),
            switchMap((jwtToken) => {
                return of(getJwtToken())
            })
        )
    );

}

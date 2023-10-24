import { ActivatedRouteSnapshot, BaseRouteReuseStrategy, DetachedRouteHandle, RouteReuseStrategy } from "@angular/router";

export  class CustomReuseStrategy implements  BaseRouteReuseStrategy {
    /**
   * Whether the given route should detach for later reuse.
   * Always returns false for `BaseRouteReuseStrategy`.
   * */
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return false;
      }
    
      /**
       * A no-op; the route is never stored since this strategy never detaches routes for later re-use.
       */
      store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {}
    
      /** Returns `false`, meaning the route (and its subtree) is never reattached */
      shouldAttach(route: ActivatedRouteSnapshot): boolean {
        return false;
      }
    
      /** Returns `null` because this strategy does not store routes for later re-use. */
      retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle|null {
        return null;
      }
    
      /**
       * Determines if a route should be reused.
       * This strategy returns `true` when the future route config and current route config are
       * identical.
       */
    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return (future.routeConfig === curr.routeConfig) ||  future.data['reuseComponent'];
    }

}
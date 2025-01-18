import { Injectable, inject, signal } from '@angular/core';
import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, filter, map, tap, throwError } from 'rxjs';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private errorService = inject(ErrorService);
  private userPlaces = signal<Place[]>([]);
  private httpClient = inject(HttpClient);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/places',
      'Somthing went wrong when fetching avalible places'
    );
  }

  loadUserPlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/user-places',
      'Somthing went wrong when fetching your fav places'
    ).pipe(
      tap({
        next: (userPlaces) => this.userPlaces.set(userPlaces),
      })
    );
  }

  addPlaceToUserPlaces(place: Place) {
    const prePlaces = this.userPlaces();

    if (!prePlaces.some((p) => p.id === place.id)) {
      this.userPlaces.set([...prePlaces, place]);
    }

    return this.httpClient
      .put('http://localhost:3000/user-places', {
        placeId: place.id,
      })
      .pipe(
        catchError((err) => {
          this.userPlaces.set(prePlaces);
          this.errorService.showError('Filed to store selsected places');
          return throwError(() => new Error('Filed to store selsected places'));
        })
      );
  }

  removeUserPlace(place: Place) {
    const prevPlaces = this.userPlaces();
    if (prevPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.set(prevPlaces.filter((plc) => plc.id !== place.id));
    }
    return this.httpClient
      .delete(`http://localhost:3000/user-places/${place.id}`)
      .pipe(
        catchError((err) => {
          this.userPlaces.set(prevPlaces);
          this.errorService.showError('Filed to delete selsected places');
          return throwError(
            () => new Error('Filed to delete selsected places')
          );
        })
      );
  }

  private fetchPlaces(url: string, errMessage: string) {
    return this.httpClient.get<{ places: Place[] }>(url).pipe(
      map((resData) => resData.places),
      catchError((err) => {
        console.log(err);
        return throwError(() => new Error(errMessage));
      })
    );
  }
}

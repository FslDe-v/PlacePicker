import { Component, signal, inject, DestroyRef, OnInit } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { HttpClient } from '@angular/common/http';
import { Place } from '../place.model';
import { catchError, map, throwError } from 'rxjs';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {
  private placesService = inject(PlacesService);
  places = this.placesService.loadedUserPlaces;
  isFetching = signal(false);
  error = signal('');
  private destroyRef = inject(DestroyRef);

  // Fetch data
  ngOnInit() {
    this.isFetching.set(true);
    const subscription = this.placesService.loadUserPlaces().subscribe({
      error: (err: Error) => {
        this.error.set(err.message);
      },
      complete: () => this.isFetching.set(false),
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  onRemovePlace(place: Place) {
    const subscription = this.placesService.removeUserPlace(place).subscribe();
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}

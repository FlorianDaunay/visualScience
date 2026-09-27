import { HttpClient } from "@angular/common/http";
import { Injectable, Signal, computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Observable, shareReplay } from "rxjs";
import { environment } from "../../../environments/environment";
import { Discovery, DataMeta, Institution, Researcher, StatsOverview } from "../models";
import { Loadable, toLoadable } from "./loadable";

const PENDING: Loadable<never> = { value: null, loading: true, error: null };

/**
 * Fetches the static JSON files written by `scripts/fetch-data.mts` (see `data/README.md`).
 * Each file is requested once per app load and cached (`shareReplay(1)`) so every feature that
 * needs, say, the discoveries list shares one request and one signal.
 */
@Injectable({ providedIn: "root" })
export class DataService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, Signal<Loadable<unknown>>>();

  readonly meta = this.resource<DataMeta>("meta.json");
  readonly discoveries = this.resource<Discovery[]>("discoveries.json");
  readonly researchers = this.resource<Researcher[]>("researchers.json");
  readonly institutions = this.resource<Institution[]>("institutions.json");
  readonly stats = this.resource<StatsOverview>("stats.json");

  /** A single discovery by id, derived from the (already cached) full list. */
  discovery(id: string): Signal<Loadable<Discovery>> {
    return this.derive(this.discoveries, (list) => list.find((d) => d.id === id) ?? null);
  }

  researcher(id: string): Signal<Loadable<Researcher>> {
    return this.derive(this.researchers, (list) => list.find((r) => r.id === id) ?? null);
  }

  institution(id: string): Signal<Loadable<Institution>> {
    return this.derive(this.institutions, (list) => list.find((i) => i.id === id) ?? null);
  }

  private resource<T>(file: string): Signal<Loadable<T>> {
    const cached = this.cache.get(file);
    if (cached) return cached as Signal<Loadable<T>>;

    const request$: Observable<T> = this.http
      .get<T>(`${environment.dataBaseUrl}/${file}`)
      .pipe(shareReplay({ bufferSize: 1, refCount: false }));

    const signal = toSignal(toLoadable(request$), { initialValue: PENDING as Loadable<T> });
    this.cache.set(file, signal as Signal<Loadable<unknown>>);
    return signal;
  }

  /** Wraps a lookup into an existing `Loadable<T[]>` resource as its own reactive `Loadable<T>`. */
  private derive<T, U>(source: Signal<Loadable<T[]>>, pick: (list: T[]) => U | null): Signal<Loadable<U>> {
    return computed(() => {
      const state = source();
      if (state.loading) return PENDING as Loadable<U>;
      if (state.error) return { value: null, loading: false, error: state.error };
      const value = pick(state.value ?? []);
      return value
        ? { value, loading: false, error: null }
        : { value: null, loading: false, error: "Not found." };
    });
  }
}

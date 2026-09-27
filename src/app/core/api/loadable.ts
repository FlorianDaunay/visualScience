import { Observable, catchError, map, of, startWith } from "rxjs";

/** The state of one async fetch, as a plain value so it can live in a signal. */
export interface Loadable<T> {
  value: T | null;
  loading: boolean;
  error: string | null;
}

const PENDING: Loadable<never> = { value: null, loading: true, error: null };

/** Turns a one-shot HTTP observable into a `Loadable<T>` stream: pending, then value or error. */
export function toLoadable<T>(source$: Observable<T>): Observable<Loadable<T>> {
  return source$.pipe(
    map((value): Loadable<T> => ({ value, loading: false, error: null })),
    startWith(PENDING as Loadable<T>),
    catchError((error: unknown) =>
      of<Loadable<T>>({
        value: null,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load data.",
      }),
    ),
  );
}

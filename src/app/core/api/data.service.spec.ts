import { TestBed } from "@angular/core/testing";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Discovery } from "../models";
import { DataService } from "./data.service";

const sample: Discovery[] = [
  {
    id: "W1",
    title: "Sample discovery",
    abstractText: null,
    publishedDate: "2026-01-01",
    doi: null,
    sourceUrl: "https://example.org",
    isOpenAccess: true,
    venueName: "Journal of Testing",
    citedByCount: 5,
    concepts: [],
    authors: [{ id: "A1", name: "Ada Lovelace" }],
    institutions: [],
    openAlexUrl: "https://openalex.org/W1",
  },
];

describe("DataService", () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  /**
   * `DataService` eagerly requests every resource on construction (meta, researchers,
   * institutions, stats), even in tests that only care about `discoveries`. Flushes the ones a
   * test isn't exercising so `httpMock.verify()` doesn't see them as unhandled.
   */
  function flushUnusedResources(): void {
    for (const file of ["meta.json", "researchers.json", "institutions.json", "stats.json"]) {
      httpMock.expectOne(`${environment.dataBaseUrl}/${file}`).flush({});
    }
  }

  it("starts in a loading state before the response arrives", () => {
    expect(service.discoveries().loading).toBeTrue();
    httpMock.expectOne(`${environment.dataBaseUrl}/discoveries.json`).flush(sample);
    flushUnusedResources();
  });

  it("exposes the fetched discoveries once loaded", () => {
    httpMock.expectOne(`${environment.dataBaseUrl}/discoveries.json`).flush(sample);
    flushUnusedResources();
    const state = service.discoveries();
    expect(state.loading).toBeFalse();
    expect(state.value).toEqual(sample);
  });

  it("looks a single discovery up by id from the same cached list", () => {
    httpMock.expectOne(`${environment.dataBaseUrl}/discoveries.json`).flush(sample);
    flushUnusedResources();
    expect(service.discovery("W1")().value?.title).toBe("Sample discovery");
    expect(service.discovery("missing")().error).toBeTruthy();
  });

  it("shares one request across repeated resource access", () => {
    service.discoveries();
    service.discoveries();
    // A second, distinct call site reading the same resource must not trigger another request.
    httpMock.expectOne(`${environment.dataBaseUrl}/discoveries.json`).flush(sample);
    flushUnusedResources();
    expect(service.discoveries().value).toEqual(sample);
  });
});

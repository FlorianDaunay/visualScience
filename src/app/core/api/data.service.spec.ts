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

  it("starts in a loading state before the response arrives", () => {
    expect(service.discoveries().loading).toBeTrue();
    httpMock.expectOne(`${environment.dataBaseUrl}/discoveries.json`).flush(sample);
  });

  it("exposes the fetched discoveries once loaded", () => {
    httpMock.expectOne(`${environment.dataBaseUrl}/discoveries.json`).flush(sample);
    const state = service.discoveries();
    expect(state.loading).toBeFalse();
    expect(state.value).toEqual(sample);
  });

  it("looks a single discovery up by id from the same cached list", () => {
    httpMock.expectOne(`${environment.dataBaseUrl}/discoveries.json`).flush(sample);
    expect(service.discovery("W1")().value?.title).toBe("Sample discovery");
    expect(service.discovery("missing")().error).toBeTruthy();
  });

  it("shares one request across repeated resource access", () => {
    service.discoveries();
    service.discoveries();
    httpMock.expectOne(`${environment.dataBaseUrl}/discoveries.json`).flush(sample);
  });
});

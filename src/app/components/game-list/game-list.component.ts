import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  HostListener
} from "@angular/core";
import { Subject, fromEvent } from "rxjs";
import {
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap
} from "rxjs/operators";
import { GameListService, GamesSortBy } from "./game-list.service";
import { detectViewChanges } from "../../services/utility";
import { GameDetail } from "../../entities/app.entities";

@Component({
  selector: "game-list",
  templateUrl: "./game-list.component.html",
  styleUrls: ["./game-list.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GameListService]
})
export class GameListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("gameSearch") private gameSearch: ElementRef;
  @ViewChild("clearSearch") private clearSearch: ElementRef;
  @ViewChild("autoComplete") private autoComplete: ElementRef;

  private unsubscriber: Subject<any> = new Subject();
  private loadData: Subject<{
    sortBy: string;
    searchTerm?: string;
  }> = new Subject();
  games: Array<GameDetail> = [];
  autoCompleteList: Array<GameDetail> = [];
  sortByOptions = [GamesSortBy.rank, GamesSortBy.year];
  sortBy: GamesSortBy = GamesSortBy.rank;
  showAutoComplete: boolean = false;
  searchTerm: string = "";

  @HostListener("document:click")
  documentClick(event) {
    if (
      !this.autoComplete ||
      !this.autoComplete.nativeElement ||
      !event ||
      !event.target
    ) {
      this.showAutoComplete = false;
      return;
    }

    if (!this.autoComplete.nativeElement.contains(event.target)) {
      this.showAutoComplete = false;
    }
  }

  constructor(
    private gameListService: GameListService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData
      .pipe(
        switchMap((event: { sortBy: GamesSortBy; searchTerm: string }) => {
          console.log("Switch Map");
          return this.gameListService.getTopSellingGames(
            event && event.sortBy,
            event && event.searchTerm
          );
        }),
        takeUntil(this.unsubscriber)
      )
      .subscribe(data => {
        this.games = (data && data.filteredGames) || [];
        this.autoCompleteList = data && data.autoCompleteGames;
        detectViewChanges(this.cdr);
      });

    this.refreshData();
  }

  ngAfterViewInit() {
    if (this.gameSearch && this.gameSearch.nativeElement) {
      fromEvent(this.gameSearch.nativeElement, "input")
        .pipe(
          debounceTime(300),
          map((event: any) => event.target.value),
          distinctUntilChanged(),
          takeUntil(this.unsubscriber)
        )
        .subscribe((searchTerm: string) => {
          this.searchTerm = searchTerm;
          this.showAutoComplete = true;
          this.refreshData();
        });
    }

    if (this.clearSearch && this.clearSearch.nativeElement) {
      fromEvent(this.clearSearch.nativeElement, "click")
        .pipe(takeUntil(this.unsubscriber))
        .subscribe((searchTerm: string) => {
          this.searchTerm = null;
          this.refreshData();
        });
    }
  }

  ngOnDestroy() {
    this.unsubscriber.next();
    this.unsubscriber.complete();
  }

  refreshData() {
    this.loadData.next({
      sortBy: this.sortBy,
      searchTerm: this.searchTerm
    });
  }

  selectGame(game: GameDetail) {
    this.showAutoComplete = false;
    if (!game) {
      return;
    }

    this.searchTerm = game.Name;
    this.games = [game];
    detectViewChanges(this.cdr);
  }

  onSortChange(event) {
    this.sortBy = event && event.target ? event.target.value : GamesSortBy.rank;
    this.refreshData();
  }
}

import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { DataService } from "../../services/data.service";
import { GameDetail } from "../../entities/app.entities";
import { map } from "rxjs/operators";

export enum GamesSortBy {
  rank = "rank",
  year = "year"
}

@Injectable()
export class GameListService {
  private games: Array<GameDetail>;

  constructor(private dataService: DataService) {}
  //
  getTopSellingGames(
    sortBy: GamesSortBy,
    searchTerm?: string
  ): Observable<{
    filteredGames: Array<GameDetail>;
    autoCompleteGames: Array<GameDetail>;
  }> {
    if (!this.games || !this.games.length) {
      return this.dataService.getTopSellingGames().pipe(
        map((games: Array<GameDetail>) => {
          if (!games || !games.length) {
            return { filteredGames: [], autoCompleteGames: [] };
          }
          this.games = games;
          return this.returnFilteredGames(sortBy, searchTerm);
        })
      );
    }

    return of(this.returnFilteredGames(sortBy, searchTerm));
  }

  private returnFilteredGames(sortBy: GamesSortBy, searchTerm?: string) {
    if (!this.games || !this.games.length) {
      return { filteredGames: [], autoCompleteGames: [] };
    }

    let filteredGames: Array<GameDetail> = [],
      autoCompleteGames: Array<GameDetail> = [];
    if (searchTerm == null || searchTerm.trim() === "") {
      filteredGames = this.games;
    } else {
      // filteredGames = this.games.filter(
      //   game =>
      //     game &&
      //     game.Name &&
      //     game.Name.toLowerCase().includes(searchTerm.toLowerCase())
      // );

      this.games.forEach((game: GameDetail) => {
        if (!game) {
          return;
        }

        if (
          game.Name &&
          game.Name.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          filteredGames.push(game);
        }
        if (
          game.Name &&
          game.Name.toLowerCase().startsWith(searchTerm.toLowerCase())
        ) {
          autoCompleteGames.push(game);
        }
      });
    }

    switch (sortBy) {
      case GamesSortBy.rank:
        return {
          filteredGames: this.sortByRank(filteredGames),
          autoCompleteGames: autoCompleteGames
        };
      case GamesSortBy.year:
        return {
          filteredGames: this.sortByYear(filteredGames),
          autoCompleteGames: autoCompleteGames
        };
      default:
        return {
          filteredGames: this.sortByRank(filteredGames),
          autoCompleteGames: autoCompleteGames
        };
    }
  }

  private sortByRank(games: Array<GameDetail>) {
    if (!this.games || !this.games.length) {
      return games;
    }

    return games.sort((game1, game2) => game1.Rank - game2.Rank);
  }

  private sortByYear(games: Array<GameDetail>) {
    if (!this.games || !this.games.length) {
      return games;
    }

    return games.sort((game1, game2) => game1.Year - game2.Year);
  }
}

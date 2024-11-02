"""
This module shows how I wrangled the playoff series data in `playoff_series_results.csv`, which I use in other modules.
"""

from pybaseball import retrosheet
from pandas import DataFrame
from team_name_map import team_names_to_current_map


def download_playoff_retrosheets():
    """
    Downloads playoff data from retrosheets.
    """
    ws = retrosheet.world_series_logs()
    cs = retrosheet.lcs_logs()
    ds = retrosheet.division_series_logs()
    wc = retrosheet.wild_card_logs()
    return ws, cs, ds, wc


# Structure of the dict we use to hold series results
SeriesResult = dict["year":int, "round":str, "winner":str, "loser":str, "games":int]

# Structure used to keep track of ongoing series while iterating through individual game results
OngoingSeries = dict["gamesCount":int, "lastGameWinner":str, "lastGameLoser":str]


def get_series_winners_and_games_by_year(
    year: int, playoff_round: str, data: DataFrame
) -> list[SeriesResult]:
    """
    For a given year and playoff round, goes through the raw retrosheet data and
    gets each series' winner, loser, and number of games
    """

    # In order to filter by first four digits of date, must first convert it to a string.
    data["date"] = data["date"].apply(str)

    filtered_year = data[data["date"].str[:4] == str(year)]

    series_results: list[SeriesResult] = []
    ongoing_series: dict[OngoingSeries] = {}

    # Games are ordered by date, not series. So in order to keep track of all
    # series as we iterate, continually update the ongoing_series structure
    for _, row in filtered_year.iterrows():
        teams_key = str(sorted([row["visiting_team"], row["home_team"]]))
        last_game_winner = (
            row["visiting_team"]
            if row["visiting_score"] > row["home_score"]
            else row["home_team"]
        )
        last_game_loser = (
            row["visiting_team"]
            if row["visiting_score"] < row["home_score"]
            else row["home_team"]
        )
        games_count = row["home_team_game_num"]
        # The game count, winner, and loser of the final game applies to the
        # entire series as well. This allows us to avoid having to hard-code
        # number of games in each round (which has additionally changed over the
        # years)
        ongoing_series[teams_key] = {
            "gamesCount": games_count,
            "lastGameWinner": last_game_winner,
            "lastGameLoser": last_game_loser,
        }

    # Once the year and round has been iterated through, we can collect the results of the series
    for _, item in ongoing_series.items():
        series_results.append(
            {
                "year": year,
                "round": playoff_round,
                "winner": team_names_to_current_map[item["lastGameWinner"]],
                "loser": team_names_to_current_map[item["lastGameLoser"]],
                "games": item["gamesCount"],
            }
        )
    return series_results


def get_all_rounds_by_year(
    year: int,
    wc_data: DataFrame,
    ds_data: DataFrame,
    cs_data: DataFrame,
    ws_data: DataFrame,
) -> DataFrame:
    """
    Get results of every playoff series in a year.
    """
    return (
        get_series_winners_and_games_by_year(year, "wc", wc_data)
        + get_series_winners_and_games_by_year(year, "ds", ds_data)
        + get_series_winners_and_games_by_year(year, "cs", cs_data)
        + get_series_winners_and_games_by_year(year, "ws", ws_data)
    )


def get_all_playoffs_ever():
    """
    Download data, call helper functions to generate results, and write to CSV.
    """
    ws, cs, ds, wc = download_playoff_retrosheets()
    all_playoffs_results_ever: list[SeriesResult] = []
    for year in range(1900, 2024):
        all_playoffs_results_ever.extend(get_all_rounds_by_year(year, wc, ds, cs, ws))
    df = DataFrame(all_playoffs_results_ever)
    df.to_csv("playoff_series_results.csv")

get_all_playoffs_ever()

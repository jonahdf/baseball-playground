"""
When watching the 2024 playoffs, I thought of ways to rank the success of a
playoff run. If your team loses in the playoffs, it would generally be more
forgiveable if that team went on to have success in future rounds. And on the
flipside, it is embarrassing for your team to lose to a team that ends up
getting trounced in the next round. 

I decided to try and write an algorithm to sort the winners and losers of a
playoff bracket by this principle.

In my head, advancing to a further round moves you past all losers of the past
round, and multiple losers within the round are ranked by how successful their
opponent was in future rounds.

Example: Playoff Ranking 2024

WC: Tigers over Astros (2) 
WC: Royals over Orioles (2) 
DS: Guardians over Tigers (5) 
DS: Yankees over Royals (4) 
CS: Yankees over Guardians (5)

WC: Mets over Brewers (3) 
WC: Padres over Braves (2)
WS: Phillies over N/A (2) 
DS: Dodgers over Padres (5) 
DS: Mets over Phillies (5)
CS: Dodgers over Mets (6) 
WS: Dodgers over Yankees (5)


Ranking: 
1. Dodgers 
2. Yankees (Dodgers 1) 
3. Mets (Dodgers 1) 
4. Guardians (Yankees 2) 
5. Padres (Dodgers 1)
6. Royals (Yankees 2) 
7. Phillies (Mets 3) 
8. Tigers (Guardians 4) 
9. Brewers (Mets 3) 
10. Braves (Padres 5) 
11. Orioles (Royals 6) 
12. Astros (Tigers 8)
"""

import pandas as pd
from team_name_map import team_names_to_current_map

all_playoffs_ever = pd.read_csv("../data/playoff_series_results.csv", index_col=0)


def sort_playoffs_of_year(year: int, data=all_playoffs_ever):
    """
    Given a year of playoffs, sort by winners and losers.

    Ordering is defined by the following algorithm:
    1. WS winners and losers are 1 and 2 respectively
    2. CS losers are 3 and 4, ordered by whether they lost to the eventual WS winner
    3. DS losers are ordered by the ranking of who they lost to
    4. WC losers are ordered by the ranking of who they lost to

    Returns a dictionary where the key is the 3-letter code, value is the ranking
    """
    df = data[data["year"] == year]
    if df.empty:
        print("No data exists for year", year)
        return {}

    ranking = {}
    for playoff_round in ["ws", "cs", "ds", "wc"]:
        round_results = df[df["round"] == playoff_round]
        if playoff_round == "ws":
            # print("winner", round_results["winner"].values[0])
            ranking[round_results["winner"].values[0]] = 1
            ranking[round_results["loser"].values[0]] = 2
            continue

        # For non-world series rounds, sort the losers by the success of their winning opponents
        for _, round_result in round_results.iterrows():

            loser = round_result["loser"]
            winner_ranking = ranking[round_result["winner"]]

            within_round_ranking = (
                []
            )  # Holds rankings of the losers within the current round

            insertion_index = 0
            for i, team in enumerate(within_round_ranking):
                within_round_competitor_winner = round_results[
                    round_results["loser"] == team
                ]["winner"].values[0]
                if winner_ranking < ranking[within_round_competitor_winner]:
                    insertion_index = i
                    break
                insertion_index += 1
            within_round_ranking.insert(insertion_index, loser)

            # Once done ranking the losers of this round, add it to the year's overall playoff ranking
            for loser in within_round_ranking:
                ranking[loser] = len(ranking.values()) + 1

    return ranking


def get_all_sorted_playoff_rankings(data) -> list[dict]:
    """
    Aggregates all rankings from 1900 to present into a list.
    """
    return [sort_playoffs_of_year(year, data) for year in range(1900, 2024)]


# Structure for holding playoff ranking summaries for a given team
type TeamPlayoffStats = dict[
    "team":str, "numAppearances":int, "placements" : list[int], "averagePlacement":float
]


def get_team_playoff_stats(playoff_rankings: list[dict]) -> list[TeamPlayoffStats]:
    """
    Given a list of playoff rankings, gets stats for each team
    """
    all_team_stats: list[TeamPlayoffStats] = []
    for team in set(team_names_to_current_map.values()):
        single_team_stats: TeamPlayoffStats = {
            "team": team,
            "numAppearances": 0,
            "placements": [],
            "averagePlacement": "NA",
        }
        for ranking in playoff_rankings:
            if team in ranking:
                single_team_stats["numAppearances"] += 1
                single_team_stats["placements"].append(ranking[team])
                single_team_stats["averagePlacement"] = (
                    sum(single_team_stats["placements"])
                    / single_team_stats["numAppearances"]
                )
        all_team_stats.append(single_team_stats)
    return all_team_stats


sorted_playoff_rankings = get_all_sorted_playoff_rankings(all_playoffs_ever)
team_stats = pd.DataFrame(get_team_playoff_stats(sorted_playoff_rankings)).sort_values(
    "averagePlacement"
)
print(team_stats)

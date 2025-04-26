"""
3-Letter Codes seems to be the standard way for various data sources to refer to
team.

Given that many teams have moved or changed names, and therefore changed their
3-letter code, I found the need to create a dictionary that maps each code to
their curent franchise's code.
"""

team_names_to_current_map: dict[str] = {
    "ANA": "LAA",
    "ARI": "ARI",
    "ATL": "ATL",
    "BAL": "BAL",
    "BOS": "BOS",
    "BRO": "LAD",
    "BSN": "ATL",
    "CAL": "LAA",
    "CHA": "CHW",
    "CHN": "CHC",
    "CIN": "CIN",
    "CLE": "CLE",
    "COL": "COL",
    "DET": "DET",
    "FLO": "MIA",
    "HOU": "HOU",
    "KC1": "OAK",
    "KCA": "KCR",
    "LAN": "LAD",
    "MIA": "MIA",
    "MIL": "MIL",
    "MIN": "MIN",
    "MLN": "ATL",
    "MON": "WSN",
    "NY1": "SFG",
    "NYA": "NYY",
    "NYN": "NYM",
    "OAK": "OAK",
    "PHA": "OAK",
    "PHI": "PHI",
    "PIT": "PIT",
    "SDN": "SDP",
    "SEA": "SEA",
    "SFN": "SFG",
    "SLA": "STL",
    "SLN": "STL",
    "TBA": "TBR",
    "TEX": "TEX",
    "TOR": "TOR",
    "WAS": "WAS",
    "WS1": "MIN",
}

// Team colors and abbreviations
const MLB_TEAMS = {
    "Arizona Diamondbacks": { abbr: "ARI", color: "#A71930", division: "NL West", league: "NL" },
    "Atlanta Braves": { abbr: "ATL", color: "#CE1141", division: "NL East", league: "NL" },
    "Baltimore Orioles": { abbr: "BAL", color: "#DF4601", division: "AL East", league: "AL" },
    "Boston Red Sox": { abbr: "BOS", color: "#BD3039", division: "AL East", league: "AL" },
    "Chicago Cubs": { abbr: "CHC", color: "#0E3386", division: "NL Central", league: "NL" },
    "Chicago White Sox": { abbr: "CWS", color: "#27251F", division: "AL Central", league: "AL" },
    "Cincinnati Reds": { abbr: "CIN", color: "#C6011F", division: "NL Central", league: "NL" },
    "Cleveland Guardians": { abbr: "CLE", color: "#00385D", division: "AL Central", league: "AL" },
    "Colorado Rockies": { abbr: "COL", color: "#333366", division: "NL West", league: "NL" },
    "Detroit Tigers": { abbr: "DET", color: "#0C2340", division: "AL Central", league: "AL" },
    "Houston Astros": { abbr: "HOU", color: "#EB6E1F", division: "AL West", league: "AL" },
    "Kansas City Royals": { abbr: "KC", color: "#004687", division: "AL Central", league: "AL" },
    "Los Angeles Angels": { abbr: "LAA", color: "#BA0021", division: "AL West", league: "AL" },
    "Los Angeles Dodgers": { abbr: "LAD", color: "#005A9C", division: "NL West", league: "NL" },
    "Miami Marlins": { abbr: "MIA", color: "#00A3E0", division: "NL East", league: "NL" },
    "Milwaukee Brewers": { abbr: "MIL", color: "#0A2351", division: "NL Central", league: "NL" },
    "Minnesota Twins": { abbr: "MIN", color: "#002B5C", division: "AL Central", league: "AL" },
    "New York Mets": { abbr: "NYM", color: "#FF5910", division: "NL East", league: "NL" },
    "New York Yankees": { abbr: "NYY", color: "#003087", division: "AL East", league: "AL" },
    "Oakland Athletics": { abbr: "OAK", color: "#003831", division: "AL West", league: "AL" },
    "Philadelphia Phillies": { abbr: "PHI", color: "#E81828", division: "NL East", league: "NL" },
    "Pittsburgh Pirates": { abbr: "PIT", color: "#27251F", division: "NL Central", league: "NL" },
    "San Diego Padres": { abbr: "SD", color: "#2F241D", division: "NL West", league: "NL" },
    "San Francisco Giants": { abbr: "SF", color: "#FD5A1E", division: "NL West", league: "NL" },
    "Seattle Mariners": { abbr: "SEA", color: "#0C2C56", division: "AL West", league: "AL" },
    "St. Louis Cardinals": { abbr: "STL", color: "#C41E3A", division: "NL Central", league: "NL" },
    "Tampa Bay Rays": { abbr: "TB", color: "#092C5C", division: "AL East", league: "AL" },
    "Texas Rangers": { abbr: "TEX", color: "#003278", division: "AL West", league: "AL" },
    "Toronto Blue Jays": { abbr: "TOR", color: "#134A8E", division: "AL East", league: "AL" },
    "Washington Nationals": { abbr: "WSH", color: "#AB0003", division: "NL East", league: "NL" }
};

// Global variables
let chart;
let allTeamData = {};
let selectedTeams = Object.keys(MLB_TEAMS);
let currentMetric = 'winPct';
let currentDivision = 'all';
let currentLeague = 'all';
let currentSeason = '2025';
let isLiveSeason = true;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initTeamToggle();
    initFilterEvents();
    fetchMLBData();
});

// Initialize team toggle buttons
function initTeamToggle() {
    const teamToggle = document.getElementById('team-toggle');
    
    Object.keys(MLB_TEAMS).forEach(team => {
        const button = document.createElement('button');
        button.classList.add('team-button', 'active');
        button.textContent = MLB_TEAMS[team].abbr;
        button.style.backgroundColor = MLB_TEAMS[team].color;
        button.style.color = '#ffffff';
        button.dataset.team = team;
        
        button.addEventListener('click', () => {
            button.classList.toggle('active');
            if (button.classList.contains('active')) {
                selectedTeams.push(team);
                button.style.backgroundColor = MLB_TEAMS[team].color;
                button.style.color = '#ffffff';
                button.style.borderColor = MLB_TEAMS[team].color;
            } else {
                selectedTeams = selectedTeams.filter(t => t !== team);
                button.style.backgroundColor = '#f5f5f5';
                button.style.color = MLB_TEAMS[team].color;
                button.style.borderColor = MLB_TEAMS[team].color;
            }
            updateChart();
        });
        
        teamToggle.appendChild(button);
    });
}

// Initialize filter events
function initFilterEvents() {
    // Add event listeners for the quick toggle buttons
    document.getElementById('winPct-toggle').addEventListener('click', () => {
        setActiveMetricToggle('winPct');
    });
    
    document.getElementById('wins-toggle').addEventListener('click', () => {
        setActiveMetricToggle('wins');
    });
    
    document.getElementById('metric-select').addEventListener('change', (e) => {
        currentMetric = e.target.value;
        
        // Update toggle buttons to match the dropdown selection
        updateMetricToggleState();
        
        updateChart();
    });
    
    document.getElementById('division-select').addEventListener('change', (e) => {
        currentDivision = e.target.value;
        updateTeamVisibility();
    });
    
    document.getElementById('league-select').addEventListener('change', (e) => {
        currentLeague = e.target.value;
        updateTeamVisibility();
    });
    
    document.getElementById('season-select').addEventListener('change', (e) => {
        currentSeason = e.target.value;
        isLiveSeason = currentSeason === '2025';
        
        // Update chart title with current season
        document.querySelector('h1').textContent = `MLB Team Records Over Time (${currentSeason} Season)${isLiveSeason ? '' : ' (Historical)'}`;
        
        // Clear the chart and reload the data
        if (chart) {
            chart.destroy();
            chart = null;
        }
        
        // Clear data and show loading indicator
        allTeamData = {};
        document.getElementById('loading').style.display = 'block';
        document.getElementById('error-message').textContent = '';
        
        // Fetch data for the selected season
        fetchMLBData();
    });
}

// Set the active metric toggle button and update the chart
function setActiveMetricToggle(metric) {
    // Update the currentMetric
    currentMetric = metric;
    
    // Update the dropdown to match the toggle
    const metricSelect = document.getElementById('metric-select');
    metricSelect.value = metric;
    
    // Update toggle button states
    updateMetricToggleState();
    
    // Update the chart
    updateChart();
}

// Update the visual state of the metric toggle buttons
function updateMetricToggleState() {
    const winPctToggle = document.getElementById('winPct-toggle');
    const winsToggle = document.getElementById('wins-toggle');
    
    // Reset all toggle buttons
    winPctToggle.classList.remove('active');
    winsToggle.classList.remove('active');
    
    // Set active toggle based on currentMetric
    if (currentMetric === 'winPct') {
        winPctToggle.classList.add('active');
    } else if (currentMetric === 'wins') {
        winsToggle.classList.add('active');
    }
}

// Update team visibility based on division/league filters
function updateTeamVisibility() {
    const teamButtons = document.querySelectorAll('.team-button');
    const newSelectedTeams = [];
    
    // Store currently active teams before making changes
    const wasActiveMap = {};
    selectedTeams.forEach(team => {
        wasActiveMap[team] = true;
    });
    
    teamButtons.forEach(button => {
        const team = button.dataset.team;
        const teamInfo = MLB_TEAMS[team];
        let visible = true;
        
        // Determine if team should be visible based on filters
        if (currentDivision !== 'all' && teamInfo.division !== currentDivision) {
            visible = false;
        }
        
        if (currentLeague !== 'all' && teamInfo.league !== currentLeague) {
            visible = false;
        }
        
        if (visible) {
            // Team passes filter criteria - show it
            button.style.display = 'inline-block';
            
            // If switching to a division or league view, automatically select all teams in that division/league
            // or keep previous state when switching back to "all"
            const shouldBeActive = currentDivision === 'all' && currentLeague === 'all' ? 
                button.classList.contains('active') : // Keep previous state for "all" view
                wasActiveMap[team] || !wasActiveMap.hasOwnProperty(team); // Otherwise select all visible teams
            
            if (shouldBeActive) {
                button.classList.add('active');
                newSelectedTeams.push(team);
                button.style.backgroundColor = teamInfo.color;
                button.style.color = '#ffffff';
                button.style.borderColor = teamInfo.color;
            } else {
                button.classList.remove('active');
                button.style.backgroundColor = '#f5f5f5';
                button.style.color = teamInfo.color;
                button.style.borderColor = teamInfo.color;
            }
        } else {
            // Team does not match filter - hide it
            button.style.display = 'none';
        }
    });
    
    // Update the selected teams
    selectedTeams = newSelectedTeams;
    
    // Update chart with the new selection
    updateChart();
}

// Fetch MLB data from the MLB Stats API
async function fetchMLBData() {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');
    try {
        // First, fetch the selected MLB season schedule to get the start date
        const scheduleResponse = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=${currentSeason}&gameType=R&fields=dates,date,games,gamePk`);
        const scheduleData = await scheduleResponse.json();
        
        if (!scheduleData.dates || scheduleData.dates.length === 0) {
            throw new Error('No schedule data available');
        }
        
        // Sort dates and find the first game date of the season
        const gameDates = scheduleData.dates.map(date => new Date(date.date));
        gameDates.sort((a, b) => a - b);
        const seasonStartDate = gameDates[0];
        
        // Generate array of dates from season start to today
        const today = new Date();
        const dates = [];
        let currentDate = new Date(seasonStartDate);
        
        while (currentDate <= today) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // For each date, fetch standings
        const promises = dates.map(date => {
            const formattedDate = date.toISOString().split('T')[0];
            return fetch(`https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${currentSeason}&date=${formattedDate}&standingsTypes=regularSeason&fields=records,teamRecords,team,name,league,division,nameShort,divisionRank,leagueRank,wins,losses,winningPercentage,gamesBack`)
                .then(response => response.json())
                .then(data => ({ date: formattedDate, data }))
                .catch(err => {
                    console.error(`Error fetching data for ${formattedDate}:`, err);
                    return null;
                });
        });
        
        // Process all standings data
        const results = await Promise.all(promises);
        const validResults = results.filter(result => result !== null);
        
        if (validResults.length === 0) {
            throw new Error('No valid standings data available');
        }
        
        // Process the data for each team
        allTeamData = processStandingsData(validResults);
        
        // Update the last updated timestamp
        document.getElementById('last-updated').textContent = `Last updated: ${new Date().toLocaleString()}`;
        
        // Create the chart
        createChart();
        
        loadingElement.style.display = 'none';
    } catch (error) {
        console.error('Error fetching MLB data:', error);
        loadingElement.style.display = 'none';
        errorElement.textContent = `Error loading MLB data: ${error.message}. Please try again later.`;
    }
}

// Process standings data into time series format
function processStandingsData(results) {
    const teamData = {};
    
    // Initialize team data structure
    Object.keys(MLB_TEAMS).forEach(team => {
        teamData[team] = {
            dates: [],
            wins: [],
            losses: [],
            winPct: [],
            gameBehind: []
        };
    });
    
    // Process each day's standings
    results.forEach(result => {
        if (!result || !result.data || !result.data.records) return;
        
        const date = result.date;
        
        // Process each division's records
        result.data.records.forEach(record => {
            record.teamRecords.forEach(teamRecord => {
                const teamName = teamRecord.team.name;
                
                // Skip if team not in our mapping
                if (!MLB_TEAMS[teamName]) return;
                
                // Add data point for this date
                teamData[teamName].dates.push(date);
                teamData[teamName].wins.push(parseInt(teamRecord.wins));
                teamData[teamName].losses.push(parseInt(teamRecord.losses));
                teamData[teamName].winPct.push(parseFloat(teamRecord.winningPercentage));
                teamData[teamName].gameBehind.push(teamRecord.gamesBack === '-' ? 0 : parseFloat(teamRecord.gamesBack));
            });
        });
    });
    
    return teamData;
}

// Create the chart with Chart.js
function createChart() {
    const ctx = document.getElementById('mlbChart').getContext('2d');
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: generateDatasets()
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                intersect: false
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM d'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: getYAxisTitle()
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return new Date(context[0].parsed.x).toLocaleDateString();
                        },
                        label: function(context) {
                            const team = context.dataset.label;
                            const value = context.parsed.y;
                            const metric = currentMetric;
                            
                            if (metric === 'winPct') {
                                return `${team}: ${(value * 100).toFixed(1)}%`;
                            } else if (metric === 'gameBehind') {
                                return `${team}: ${value === 0 ? '-' : value} GB`;
                            } else {
                                return `${team}: ${value}`;
                            }
                        }
                    }
                },
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// Generate datasets for the chart based on selected teams and metric
function generateDatasets() {
    const datasets = [];
    
    selectedTeams.forEach(team => {
        if (!allTeamData[team] || !allTeamData[team].dates.length) return;
        
        datasets.push({
            label: MLB_TEAMS[team].abbr,
            backgroundColor: MLB_TEAMS[team].color,
            borderColor: MLB_TEAMS[team].color,
            data: allTeamData[team].dates.map((date, idx) => ({
                x: date,
                y: allTeamData[team][currentMetric][idx]
            })),
            fill: false,
            tension: 0.1,
            borderWidth: 2,
            pointRadius: 2,
            pointHoverRadius: 5
        });
    });
    
    return datasets;
}

// Get Y-axis title based on current metric
function getYAxisTitle() {
    switch (currentMetric) {
        case 'winPct':
            return 'Win Percentage';
        case 'wins':
            return 'Wins';
        case 'losses':
            return 'Losses';
        case 'gameBehind':
            return 'Games Behind';
        default:
            return '';
    }
}

// Update the chart with new data
function updateChart() {
    if (!chart) return;
    
    // Update datasets
    chart.data.datasets = generateDatasets();
    
    // Update Y-axis title
    chart.options.scales.y.title.text = getYAxisTitle();
    
    // Update the chart
    chart.update();
}

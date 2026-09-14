---
layout: default
title: "Points History - Atlanta United"
permalink: /points-history/
team: ATLUTD
team_name: Atlanta United
competitions:
  - MLS
number_matches_regular_season: 34


Article_Comments: false

---

<div class="Points-History">
    <div class="Points-History-Header">
        <h1>{{ page.team_name }} Points by Matchday</h1>
        <p>
            Match-by-match cumulative MLS regular season points totals by season.
        </p>
    </div>

    <div class="Points-History-Summary" id="Points_History_Summary">
        Loading summary...
    </div>

    <div class="Points-History-Chart-Wrapper">
        <canvas id="Points_History_Chart"></canvas>

        <div class="Points-History-Chart-Rounds" id="Points_History_Chart_Rounds"></div>
    </div>

    <div class="Points-History-Details" id="Points_History_Details">
    </div>
</div>

---


<div class="Points-History-Insight-Group">
    <h2>Context of the Current Season</h2>

    <table class="Points-History-Insight-Table">
        <tbody>
            <tr>
                <th>Worst Start</th>
                <td id="Points_History_Insight_Worst_Start"></td>
            </tr>
            <tr>
                <th>Best Start</th>
                <td id="Points_History_Insight_Best_Start"></td>
            </tr>
            <tr>
                <th>Current Rank</th>
                <td id="Points_History_Insight_Current_Rank"></td>
            </tr>
            <tr>
                <th>Average</th>
                <td id="Points_History_Insight_Average_Points"></td>
            </tr>
            <tr>
                <th>Gap to Best</th>
                <td id="Points_History_Insight_Gap_To_Best"></td>
            </tr>
        </tbody>
    </table>
</div>

---

<div class="Points-History-Insight-Group">
    <h2>Full Season Context</h2>

    <table class="Points-History-Insight-Table">
        <tbody>
            <tr>
                <th>Final Points</th>
                <td id="Points_History_Insight_Final_Points_Table"></td>
            </tr>
        </tbody>
    </table>
</div>

---

<div class="Points-History-Insight-Group">
    <h2>Pace and Projection</h2>

    <table class="Points-History-Insight-Table">
        <tbody>
            <tr>
                <th>Current Pace</th>
                <td id="Points_History_Insight_Current_Pace"></td>
            </tr>
            <tr>
                <th>Points Per Game</th>
                <td id="Points_History_Insight_Current_PPG"></td>
            </tr>

        </tbody>
    </table>
</div>

---

<div class="Points-History-Insight-Group">
    <h2>Streaks</h2>

    <table class="Points-History-Insight-Table">
        <tbody>

        </tbody>
    </table>
</div>

---

<div class="Points-History-Insight-Group">
    <h2>Turning Points / Momentum</h2>

    <table class="Points-History-Insight-Table">
        <tbody>

        </tbody>
    </table>
</div>

---

<div class="Points-History-Insight-Group">
    <h2>Milestones</h2>

    <table class="Points-History-Insight-Table">
        <tbody>

        </tbody>
    </table>
</div>

---

<div class="Points-History-Insight-Group">
    <h2>Matchday Comparisons</h2>

    <table class="Points-History-Insight-Table">
        <tbody>

        </tbody>
    </table>
</div>

---

<div class="Points-History-Insight-Group">
    <h2>Distribution / Consistency</h2>

    <table class="Points-History-Insight-Table">
        <tbody>

        </tbody>
    </table>
</div>

---

<div class="Points-History-Insight-Group">
    <h2>Visuals</h2>

    <table class="Points-History-Insight-Table">
        <tbody>

        </tbody>
    </table>
</div>

---

<div class="Points-History-Insight-Group">
    <h2>Simple Narrative Flags</h2>

    <table class="Points-History-Insight-Table">
        <tbody>

        </tbody>
    </table>
</div>

---



## Analysis (Planned)

### Current Season Context
- [x] Worst start through current matchweek
- [x] Best start through current matchweek
- [x] Current season rank
- [x] Rank of current season at this stage (e.g., 9th of 10)
- [x] Average points through current matchweek (historical baseline)
- [x] Gap vs best season at this stage
- [x] Gap vs playoff-caliber pace (if defined)

### Full-Season Context
- Final points per season (table)
- Rank of each season all-time
- Best season (points)
- Worst season (points)
- Points range (min to max)

### Pace and Projection
- [x] Points per game (current season)
- [x] Projected final points (PPG × 34)
- Comparison to best season pace
- Comparison to worst season pace
- Required PPG to match best season pace
- Required PPG to match playoff cutoff (if defined)

### Streaks
- Longest winning streak (all-time)
- Longest unbeaten streak (all-time)
- Longest losing streak (all-time)
- Current streak (e.g., L2, W1, unbeaten 3)
- Best start streak (e.g., most wins to start a season)

### Turning Points / Momentum
- Biggest winless stretch per season
- Biggest positive run (points in last N games)
- Points gained over last 5 matches (rolling form)
- Best single stretch (e.g., 15 points in 6 matches)

### Milestones
- Fastest to 10 / 20 / 30 / 40 points
- Latest to reach those thresholds
- Did a season ever fail to reach X points?

### Matchday Comparisons
- Best 5-game window
- Worst 5-game window
- Most consistent season (fewest zero-point games)

### Distribution / Consistency
- Number of wins / draws / losses per season
- Percentage of games with points (W or D)
- Variance of points per match
- Longest gaps between wins

### Visuals
- Highlight current season
- Highlight best season
- Toggle seasons on/off
- Show endpoint labels (final points)

### Simple Narrative Flags
- Worst start in club history through X matches
- On pace for lowest points total since ____
- Currently tracking below historical average by X points
- No season has recovered from this position to finish above ___
- Only one season started this poorly (YEAR)


<script>
    window.Points_History_Data = {{ site.data.Matches[page.team] | jsonify }};
    window.Points_History_Config = {
        Team: {{ page.team | jsonify }},
        Team_Name: {{ page.team_name | jsonify }},
        Competitions: {{ page.competitions | jsonify }},
        Number_Matches_Regular_Season: {{ page.number_matches_regular_season | jsonify }}
    };

    {% assign Color_Key = "Seasons_" | append: page.team %}
    window.Points_History_Colors = {{ site.data.Colors[Color_Key] | jsonify }};
</script>

<script src="{{ '/assets/js/chart.umd.min.js' | relative_url }}"></script>
<script src="{{ '/assets/js/Points_History.js' | relative_url }}"></script>


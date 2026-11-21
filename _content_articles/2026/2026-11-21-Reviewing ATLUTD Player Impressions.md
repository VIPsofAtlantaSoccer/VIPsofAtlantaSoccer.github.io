---
layout: page

# ---------------------------------------------------------------------------
# Article metadata
# ---------------------------------------------------------------------------
title:       "Atlanta United Player Impressions 2026"
subheadline: "Atlanta's season, through 3,000 of my match notes"
teaser:      "A team split by the World Cup break, three DPs on different paths, and the players who stood out more off the bench."
date: 2026-11-21 07:41:15 -0400

author: VIPs

categories:
    - ATLUTD
    - Player Impression

# ---------------------------------------------------------------------------
# Asset Directory
# ---------------------------------------------------------------------------
content_assets: /content_assets/2026/2026-11-18-Player Impression 2026

game_notes_csv: "/content_assets/2026/2026-11-18-Player Impression 2026/Game_Notes.csv"

# ---------------------------------------------------------------------------
# Hero Image
# ---------------------------------------------------------------------------
hero:
    file: /content_assets/2026/2026-11-18-Player Impression 2026/hero.webp
    caption: ""

published: true

---

Every match this season, I kept notes.  I wrote what I saw as it happened.  A pass that split the lines.  Off the ball movement.  A player who disappeared for twenty minutes.  This isn't based on Opta data.  It's based on my impressions during a match.  A player I mention a lot may have been brilliant, or may have been a problem.  Or may have simply dyed his hair.

Those notes became the backbone of every match article and every set of Player Impressions.  I wrote approximately 3,000 notes during play.

Doing this allows me to perform some analytics across the season.  My compiled notes show who came and went around the World Cup break, and who stood out more off the bench than starting.  They follow the three DPs through the season.  They show when in a match players caught my eye, and who was missing, and why.

{% include Season_Data.html
   team_name_metadata="ATLUTD"
   team_name_lineup="Atlanta United"
   date_start="2026-03-21"
   date_stop="2026-11-07"
   break_start="2026-05-24"
   break_stop="2026-07-16"
   break_label="World Cup Break"
   count_label="Impressions"
   player_aliases="Game_Notes_Players"
%}

---
## Impressions Per Match

This is the 2026 season, one match at a time.  Each row is a player, and the bright cells are the nights he kept showing up in the notes.  The dashed line is the World Cup break.  The team on either side of it looks very different.

{% include Season_Chart.html 
    chart="notes_grid" 
%}

The seaon's biggest divider was the World Cup Break.  Atlanta played 10 matches before the World Cup and 20 after.  Four of the first half's players were gone by the break.  Lobjanidze, Galarza, Berrocal, and Amador.  Thirteen players started playing after the break.

Once arriving, the new players went straight into the lineup.  Embolo started every match after he arrived.  So did Galoppo.  Alonso started 18 of 19.

After the break, almost 30 percent of Atlanta's starts went to players who did not play before it.

---
## Impressions Starting vs Off the Bench

Some players show up more off the bench than they do as starters.  This chart compares the two for every player who started at least twice and came off the bench at least twice.  Each bar is impressions per 90 minutes, so a short stint off the bench and a full start sit on the same scale.

{% include Season_Chart.html 
    chart="start_vs_bench" 
    color_starter="#34547A"
    color_bench="#00B7EB"
%}

Mihaj stood out far more off the bench.  As a starter, he showed up about 7 times per 90 minutes.  Off the bench, it was 25.  Picault, Latte Lath, and Brennan were close to double as well.

Fortune and Reilly were steady either way.  Reilly was about 9 per 90 as a starter and 10 off the bench.  Fortune was 8 and 11.

---
## Impressions of the DP's

Atlanta's three Designated Players took very different paths through the season.

{% include Season_Chart.html 
    chart="player_lines" 
    players="Miguel Almirón|Breel Embolo|Alexey Miranchuk" 
%}

Almirón played in only four of the first ten matches.  After the break, he played 19 of 20.  He showed up in my notes even more after the break.  No one showed up more over the season.

Miranchuk went the other way.  He was steady before the break and quieter after it.

Embolo arrived on September 5 and started hot.  Two of his first three matches were among the busiest of anyone's season.  By the end of the season, he had cooled off.

---
## Impressions of the U22's

Three of Atlanta's young players were in the lineup almost every week.

{% include Season_Chart.html 
    chart="player_lines" 
    players="Elías Báez|Mauricio Amaro|Tomás Jacob"
    colors="#8E6BBF|#17A589|#D4A017"
%}

Báez and Jacob were fixtures from the first match.  Each started 26 matches.  Báez was steady all year.  His busiest nights came in late summer.

Jacob started quietly after the break and grew into the season.  Some of his busiest nights came in the final stretch.

Amaro joined in August.  His first appearance came off the bench on September 5.  He started every match after that.

---
## Impressions in Match time

Some players start fast.  Some come alive late.  This chart breaks a match into five-minute sections.  It shows how often a player showed up in my notes in each section, compared against the team average.  Pick any player from the list.  A dashed stretch means he was on the field there in fewer than five matches, so the number would be less reliable.

{% include Season_Chart.html 
    chart="minute_buckets" 
    players="Miguel Almirón" 
    color_player="#00B7EB"
    color_average="#999"
%}

The team average is consistent for most of a match.  It dips right after halftime and again around the 80th minute.

Almirón sits above the team average almost the whole way.  He was at his busiest early in each half.  Late in matches, he came back toward the team average.

Embolo ran above the team average for most of a match.

Alonso, Amaro, and Galoppo stand-out under the team average.  Galoppo showed up less as a game proceeds.

Fortune starts strong and cooled off.  He missed most of the summer with a hamstring injury.  After he came back, he usually came off around the hour mark.

Reilly was at his best early in each half.  He faded as each half went on.

---
## Season Availability

Not every absence is an injury.  Some are visas, suspensions, international duty, or a coach's decision.

{% include Season_Chart.html 
    chart="availability_grid" 
    color_out="#816eda"
    color_missing="#463d79"
    color_tenure="#dddddd"
%}

Of the players who were here all season, Alzate missed the most.  He was out of 48% of matchday squads.  

Reilly missed 38%.  Most of it came at the end, due to his ankle injury.

Fortune had the longest stretch out.  He missed eight straight matches, from July 22 to September 5, due to a hamstring injury.

Almirón missed six straight in April and May.  After the break, he only missed one.

Muyumba and Hoyos never missed a matchday squad.  Muyumba played in all matches I recorded notes for.

The new signings lost time to paperwork.  Díaz, Amaro, Galoppo, Embolo, and Alonso all missed matches waiting on visas.

---
## Season-Wide Impressions

Here is every one of my impression for the season, by half.  These are raw counts.  A player who comes off the bench will show up more in the 2nd half simply because that is when he plays.

<!-- Game Notes Chart -->
{% include Game_Notes.html csv=page.game_notes_csv %}

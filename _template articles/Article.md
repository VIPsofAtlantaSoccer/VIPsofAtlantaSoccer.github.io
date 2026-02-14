---
layout: page
#
# Content
#
subheadline: "Game Day"      # Subheadline = label:  what / where / when
title: "Title"               # 
teaser: "date - Teaser"      # Teaser = pitch: why should I care
categories:
  - ATLUTD
  - GameDay
tags:
author: ATLUTD_VIPs

image_dir: "dir"

#
# Styling
#
#header: no
image:
    title: SubDir/image.jpg
    thumb: SubDir/image.jpg
    homepage: SubDir/image.jpg
    caption: "caption"
#    caption_url: 
mediaplayer: false

status: Idea
priority: Low
notes: ""
blocking: []
dates:
  - label: "Started"
    date: "2025-12-29"

syndication:
  affiliation_id: "atlutd_fantv" # Reference to ID in affiliations.yml
  original_url: "https://atlutdfantv.com/example-article"   # overrides affiliations link
  original_date: 2026-01-02
  relationship: "republished"   # original | republished | adapted | partnership
    # original - The article first appeared somewhere else, reposting it unchanged or near-unchanged
    # republished - The article was published elsewhere first, and this is a secondary publication with permission
    # adapted - This version is materially different from the original.  Contains new material ( ex: pargraphs, quotes )
    # partnership - The article was co-published or released simultaneously.


published: false

---

## Context ##

<hr/>

### First Half:  ###
{% include centered_image.html
   file="2.jpg"
   caption="caption"
%}


### Second Half: Initiative Without Reward ###
{% include centered_image.html
   file="2.jpg"
   caption="caption ( Photo by x )"
%}


| Stat | LAFC | Atlanta United |
| :--- | :---: | :---: |
| Final Score | 1 | 0 |
| Expected Goals (xG) | 1.8 | .08 |
| Shots (Total / On Target) | 15/5 | 3/1 |
| Touches in Opponent Box | 27 | 0 |
| Big Chances Created | 4 | 0 |
| Pass Accuracy | 90% | 88% |
| Duels Won | 44% | 56% |
| Accurate Crosses | 4 | 0 |
| Saves | 1 | 3 | 
| Possession | 54% | 46% |

<cite>Article Stats courtesy of FotMob and FBRef</cite>


---

    {% include player_block.html
      heading="Career Stats"
      side_image="left"
      file="2019-Phoenix Rising.jpg"
      caption="Pheonix Rising, 2019"
      league=""
      stats="Seasons: 9|Clubs: 7|Leagues: 2|Matches: 193|Starts: 102|Minutes: 9,703|Goals: 43|Assists: 10|Penalties: 1|Yellow Card: 19|Red Cards: 3"
      cite=""
      text="Adam Jahn played in 21 games for ATLUTD, scoring 3, assisting 1."
    %}

---

{% include Timeline_Crests.html
  names="Manchester City|Preston North End|West Ham United|Derby County|Marseille|Burnley|Bolton Wanderers|Seattle Sounders|Atlanta United|Minnesota United|West Bromwich Albion"
  crests="Manchester_City.png|Preston_North_End.png|West_Ham_United.png|Derby_County.png|Marseille.png|Burnley.png|Bolton_Wanderers.png|Seattle_Sounders.png|Atlanta_United.png|Minnesota_United.png|West_Bromwich_Albion.png"
  leagues="EFL_Championship.png|EFL_Championship.png|Premier_League.png|EFL_Championship.png|Ligue 1.png|Premier_League.png|EFL_Championship.png|MLS.png|MLS.png|MLS.png|EFL_Championship.png"
%}

---

{% include centered_image.html
   file="2026-01-30 - 2026-01-31_06241213-IMG_4180.jpg"
   caption="Tata Martino ( Photo by ATLUTD VIPs )"
%}

{% include image_inline.html
   file="2026-01-30 - 2026-01-31_06241210-IMG_4161.jpg"
   caption="Adrián Gill #55. (Photo by ATLUTD VIPs)"
   align="left"
   width="400"
%}

{% include image_clear_floats.html %}

{% include image_inline.html
   file="2026-01-30 - Pita 1.jpg"
   caption="Santiago Pita #40. (Photo by Mitch Martin/Atlanta United)"
   align="right"
   width="400"
%}

{% include image_clear_floats.html %}

--- 

{% include quote.html
  mode=""
  quote="quote"
  speaker="Gianleonardo Neglia, Las Vegas Lights Sporting Director"
  source=""
  image=""
%}

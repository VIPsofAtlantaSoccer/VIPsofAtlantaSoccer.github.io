---
layout: page_match_day
#
# Content
#
subheadline: "Game Day"
title: "Atlanta United 0-1 LAFC - Defensive Effort Restored, But Attacking Execution Still Lacking"
teaser: "2025-10-05 - ATLUTD vs LAFC"
categories:
  - ATLUTD
  - GameDay
tags:
author: VIPs

# ---------------------------------------------------------------------------
# Match Day metadata (used by match_day_vs_box.html)
# ---------------------------------------------------------------------------

opponent_id: "MLS_LAFC"     # Must match ID in site.data.Opponents
location:    "Away"               # "Home" | "Away" | "Neutral"

competition: "MLS Regular Season"
match_date: 2025-10-05
match_label: "Final"

# ---------------------------------------------------------------------------
# Score information
# ---------------------------------------------------------------------------

score:
  for: 0
  against: 1

# Optional – only displayed if BOTH values exist
pens:
  for:
  against:

# ---------------------------------------------------------------------------
# Key match events
# - type is looked up in emoji_dict.json (case-sensitive!)
# - player and minute are free text
# ---------------------------------------------------------------------------

key_events:
   for:
      - type: Yellow Card
        player: "Bartosz Slisz"
        minute: 90+3

   against:
      - type: Yellow Card
        player: "Eddie Segura"
        minute: 18
      - type: Yellow Card
        player: "Mathieu Choiniere"
        minute: 54
      - type: Goal
        player: "Denis Bouanga"
        minute: 86


# ---------------------------------------------------------------------------
# Asset Directory
# ---------------------------------------------------------------------------
content_assets: /content_assets/2025/2025-10-05-ATLUTD_vs_LAFC

hero:
    file: /content_assets/2025/2025-10-05-ATLUTD_vs_LAFC/2025-10-07 - Starting XI.webp
    caption: "Starting XI pose prior to the match against Los Angeles FC at BMO Stadium in Los Angeles, CA on Sunday October 5, 2025. (Photo by Mitch Martin-Atlanta United)"

published: true

---

<script src="/assets/js/Match_Lineup.js"></script>
{% assign Match_Lineup_File = page.content_assets | append: "/Match_Lineup.json" %}
{% include Match_Lineup.html lineup_file=Match_Lineup_File %}


<hr/>


Atlanta entered BMO Stadium eliminated from postseason contention, seeking stability against a surging LAFC side.  Ronny Deila going with 5-3-2: Hibbert in goal; Mihaj, Berrocal, Gregersen in central defense; Hernández and Amador as wing-backs; Slisz and Alzate anchoring midfield; Almirón and Miranchuk behind striker Thiaré.

{% include centered_image.html
   file="2025-10-07 - 1.webp"
   caption="Atlanta United players warm up prior to the match against Los Angeles FC at BMO Stadium in Los Angeles, CA on Sunday October 5, 2025. (Photo by Mitch Martin-Atlanta United)"
%}

Referee Allen Chapman (VAR Michael Radchuk) oversaw proceedings.

Deila later described his desired approach as organized, hard-working, and disciplined - a structure designed to restore order after weeks of inconsistency.

<cite>Article Stats courtesy of FotMob and FBRef</cite>
 
---
## 1st Half - Compact Shape, Limited Threat ##
{% include centered_image.html
   file="2025-10-07 - Steven Alzate 7 and forward Miguel Almiron.webp"
   caption="Atlanta United midfielder Steven Alzate #7 and forward Miguel Almirón #10 react during the first half of the match against Los Angeles FC at BMO Stadium in Los Angeles, CA on Sunday Oct 5th, 2025. (Photo by Mitch Martin-Atlanta United)"
%}

Atlanta began positively, defending in a compact back five with short distances between lines.  Almirón dropped deep to help circulation; Miranchuk drifted into half-spaces; Thiaré pressed high and tracked back nearly to the 18 to recover possession.  
Bouanga tested the back line periodically, slipping behind in the 6th and 17th minutes, both times denied by Gregersen’s recovery and Hibbert’s saves.  Palencia forced another fingertip stop in the 25th minute.  Atlanta were seemingly coached to swarm the ball carrier, all defensive players attempting to prevent a runner from entering the box.  

{% include centered_image.html
   file="Seinfeld_Swarm.gif"
   caption=""
%}

The shape absorbed pressure well but struggled to transition forward.  Slisz and Alzate were often outmatched by Delgado and Segura; turnovers came too quickly for the attack to build rhythm.  Alexey had a pop from outside the 18, but it was immediately blocked.

At the interval LAFC led nearly every category - Shots 9-1, Shots on Target 2-0, xG 1.01-0.03, but the scoreline remained 0-0.  Hibbert, Gregersen, and Almirón were standouts in a first half defined by resistance more than creation.

---
## 2nd Half - Structure, No Threat ##
{% include centered_image.html
   file="2025-10-07 - omd0xtrn3q9zzsdjst2k.webp"
   caption="Alexey Miranchuk attacking against Los Angeles FC at BMO Stadium in Los Angeles, CA on Sunday October 5, 2025. (Photo by Mitch Martin-Atlanta United)"
%}

Atlanta dropped even deeper after the restart, further focusing on containment.
Slisz improved on the ball, winning midfield duels and releasing occasional forward passes, but Atlanta’s possession remained mostly lateral.

Bouanga and Son continued exploiting gaps behind the high line, with Hibbert making fantastic double-saves in the 57′.
{% include centered_image.html
   file="2025-10-07 - Atlanta United midfielder Bartosz Slisz 99.webp"
   caption="Atlanta United midfielder Bartosz Slisz #99 dribbles during the first half of the match against Los Angeles FC at BMO Stadium in Los Angeles, CA on Sunday October 5, 2025. (Photo by Mitch Martin/Atlanta United)"
%}

Atlanta’s first real attack arrived at 58′ when Slisz fired from distance, forcing Lloris into his only save.  His deflected effort off the post at 70′ was inches from stealing a lead, but those two moments would be Atlanta’s only real shots on target.  

Substitutions at 71′ (Muyumba, Latte Lath) and 78′ (Saba) added fresh legs but no clarity.  The breakthrough came in the 86’: a high cross came in from the left.  Mihaj gets a head to it, causing it to fall to a completely unmarked Bouanga.  He finishes from inside the 6.  Hibbert was stuck trying to mark two players and stop the shot.  Hibbert later said, “I’m not entirely sure what the rest of the backline looked like” and “I don’t think I should have gone into that blocking shape”.  In looking back, he may well see the deeper issue was defensive duties - Bouanga stood unmarked.  Amador watched the ball float in, and land for the shot.

Atlanta never recovered. They ended the 2nd with zero touches inside LAFC’s box and only two shots in the half.  Deila later summarized: 

{% include quote.html
   mode=""
   quote="We have to get runs in the box and more crosses in there. I don’t think we managed to do that well enough. That’s why we didn’t create more than we did."
   speaker="Ronny Deila, ATLUTD Head Coach"
   source="Post-Game Press Conference"
   image="/images/quotes/Ronny Deila.jpg"
%}

---
## Key Numbers ## 

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

LAFC dominated attacking zones and second balls; Atlanta’s possession was tidy but rarely progressive. The gulf in opponent box activity - 27 touches to 0 - tells the story of this match.

---
## Where it Failed ( Structural ) ## 
**Box Presence -** Deila conceded that Atlanta “We should have more crosses in the box and more players inside the box.” Attacks often died in wide areas as runners hesitated to commit forward.

**Transition Width -** Runs from Bouanga and Son repeatedly pulled Hernández and Amador out of shape. Midfield compactness vanished whenever LAFC switched play, exposing the centerbacks to being overwhelmed.
**Risk Management -** Atlanta’s plan to grind out a 0-0 left no mechanism to chase the match once behind. The 90′ double striker substitution (Afonso, Togashi) arrived as formality, not intent.

---
## Post-Game Recap ##

Deila’s message balanced pride with frustration, 

{% include quote.html
   mode=""
   quote="'Defensively, we were very solid, very organized' and 'we really put everything on the pitch. We kept the game even. We need to get a little bit more out of the things we have around the box'"
   speaker="Ronny Deila, ATLUTD Head Coach"
   source="Post-Game Press Conference"
   image="/images/quotes/Ronny Deila.jpg"
%}

His words echoed a theme of recent weeks: defensive structure improving, attacking daring still absent.

{% include quote.html
   mode=""
   quote="We did well playing out sometimes, played long trying to connect those passes at times.  That system works well for us."
   speaker="Jayden Hibbert, ATLUTD Keeper"
   source="Post-Game Press Conference"
   image="/images/quotes/Jayden Hibbert.webp"
%}

---
## Player Notes ##
**Good**
* **Gregersen -** Multiple recovery runs and interventions even as the shape unraveled. Physically banged up, but still immense.
* **Slisz -** 67/71 passes, the most accurate passer.  Struggled in the 1st half, but improved dramatically in the 2nd
* **Almirón** - tasked with additional defensive duties, he also carried creative load in a team that stopped providing him platforms after the break.
* **Hibbert -** Not at fault on the goal; although we have said this before.  He had several strong saves throughout but may need to better organize his back line.

**Needs to Step Up**
* **Lobzhanidze -** Didn’t provide an outlet.  Only 6 touches.
* **Miranchuk -** Had moments, but inconsistent passing didn’t always reach targets.
* **Thiaré -** Selfless pressing and tracking early, but less spark than recent weeks.  He looks tired, and cannot make it the 90.  
* **Latte Lath -** played 18’.  6 touches.  2 passes.  0 shots.
Amador - watched as the only goal was scored.  

**Coaching / Game Management**
* Subs were made too late to make a difference.  With attacking options added in the 90th.  To be fair, on paper none of the available subs provided an improvement over those on the field.


---
## The Bottom Line ##
Atlanta restored defensive effort and organization, but the attack remained sterile.  With few options available ahead of Saturday’s game vs Miami, the Wooden Spoon remains a distinct possibility.

<hr/>

📌 Atlanta fans have two matches left to endure before the anticipated team overhaul can proceed.  





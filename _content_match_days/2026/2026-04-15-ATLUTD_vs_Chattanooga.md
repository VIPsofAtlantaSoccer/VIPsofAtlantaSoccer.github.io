---
layout: page_match_day
#
# Content
#
subheadline: "Rotation holds structure as Atlanta finds a usable attacking pattern"
title: "Atlanta United 3, Chattanooga FC 1"
teaser: "A left-sided overload produces repeatable chances, but defensive imbalance still concedes first"
categories:
  - ATLUTD
  - GameDay
tags:
author: VIPs

# ---------------------------------------------------------------------------
# Match Day metadata (used by match_day_vs_box.html)
# ---------------------------------------------------------------------------

opponent_id: "MLS_NextPro_Chattanooga"     # Must match ID in site.data.Opponents
location:    "Away"                 # "Home" | "Away" | "Neutral"

competition: "US Open Cup Round of 32"
match_date: 2026-04-15
match_label: "Final"

# ---------------------------------------------------------------------------
# Score information
# ---------------------------------------------------------------------------

score:
  for: 3
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
    - type: Goal
      player: "Togashi"
      minute: 21

    - type: Sub
      player: "Almirón (on)/Miranchuk (off)"
      minute: HT

    - type: Sub
      player: "Sanchez (on)/Galarza (off)"
      minute: HT

    - type: Goal
      player: "Picault"
      minute: 64

    - type: Sub
      player: "Brennan (on)/Almirón (off)"
      minute: 71

    - type: Goal
      player: "Amador"
      minute: 75

    - type: Yellow Card
      player: "Brennan"
      minute: 78

    - type: Sub
      player: "Báez (on)/Togashi (off)"
      minute: 83

    - type: Sub
      player: "Muyumba (on)/Reilly (off)"
      minute: 83

  against:
    - type: Goal
      player: "Tcheuyap"
      minute: 6

    - type: Yellow Card
      player: "Robertson"
      minute: 78

    - type: Sub
      player: "Gordon (on)/Mangarov (off)"
      minute: 63

    - type: Sub
      player: "Ancelin (on)/McGrath (off)"
      minute: 63

    - type: Sub
      player: "Ortiz (on)/Krehl (off)"
      minute: 81

    - type: Sub
      player: "García (on)/Barker John (off)"
      minute: 81


# ---------------------------------------------------------------------------
# Asset Directory
# ---------------------------------------------------------------------------
content_assets: /content_assets/2026/2026-04-15-ATLUTD_vs_Chattanooga

hero:
    file: /content_assets/2026/2026-04-15-ATLUTD_vs_Chattanooga/2026-04-15 - Starting XI.webp
    caption: "The Starting XI before the match against Chattanooga FC at Finley Stadium in Chattanooga, TN on Wednesday April 15, 2026. (Photo by Mitch Martin/Atlanta United)"

published: true

---

<script src="/assets/js/Match_Lineup.js"></script>
{% assign Match_Lineup_File = page.content_assets | append: "/Match_Lineup.json" %}
{% include Match_Lineup.html lineup_file=Match_Lineup_File %}


Atlanta United advanced with a 3–1 win over Chattanooga FC on Wednesday night. Atlanta needed a spark from a rotated lineup, and it found one through the left side.

Chattanooga repeatedly left space between its rightback and centerback, and Atlanta kept accessing that gap. The first goal came from that, with Jay Fortune finding Cayman Togashi after Atlanta broke into the channel. Matías Galarza, Pedro Amador, and Fafà Picault were the players most often arriving there, which allowed Atlanta to return to the same space across multiple sequences.

Atlanta did not need a different solution once it found that opening. It kept attacking the same channel and continued to reach the box from it.  Togashi’s finish leveled the match from that space, and Atlanta kept going back to it.

---
## {{ site.data.language.match_day_1st_half }}

Chattanooga took the lead in the sixth minute from the same defensive problem Atlanta has shown this season. Pedro Amador pushed forward on the left, and the opposite side did not drop to cover, which left the center backs exposed to a direct switch. Tate Robertson hit that pass into space, Yves Tcheuyap ran onto it, and the shot finished the sequence before Atlanta could recover.

{% include quote.html
    mode=""
    quote="We can’t give away an advantage for even five minutes because we gave away that advantage in this game and it cost us a goal."
    speaker="Tata Martino, Atlanta United Head Coach"
    source="Post-match Press Conference"
    image="/images/quotes/Tata Martino.jpg"
%}

{% include centered_image.html
   file="2026-04-15 - Togashi 1.webp"
   caption="Atlanta United forward Cayman Togashi #30 scores a goal during the match against Chattanooga FC at Finley Stadium in Chattanooga, TN on Wednesday April 15, 2026. (Photo by Mitch Martin/Atlanta United)"
%}

Atlanta’s response came through the left side, where Chattanooga allowed space between its right back and center back. Jay Fortune created the sequence by winning the ball in midfield and carrying it forward through the next line. Atlanta worked the ball into that gap and turned toward goal from it. Fortune drove into the channel and played the ball across for Cayman Togashi, who finished to level the match.

{% include quote.html
    mode=""
    quote="He was crucial for us, very important. He was on both sides of the ball; he did very well. His breaking-line runs that I know coach asked of him, he did very well in doing that, and it was very important for us."
    source="Post-match Press Conference"
    image="/images/quotes/Fafà Picault.jpg"
%}

The midfield pairing with Matías Galarza kept Atlanta moving forward because both players won the ball through contact and advanced it immediately.  Galarza, Fortune, and Will Reilly created turnovers by stepping into challenges, which allowed Atlanta to attack before Chattanooga could reset its shape. With the defense shifting and not yet organized, Atlanta moved the ball into the space between the rightback and centerback.  

Fafà Picault stayed wide along the left touchline, which held Chattanooga’s rightback in place and prevented him from stepping inside. This in turn left space between the rightback and centerback which was exploited by Galarza and Pedro Amador.  

Cayman Togashi stayed central as those attacks developed and provided the target inside the box. Atlanta continued to play balls toward him from the left side, with multiple crosses finding him in the penalty area as the team returned to the same channel.

--- 
## {{ site.data.language.match_day_2nd_half }}

Atlanta made two changes at halftime, bringing on Miguel Almirón and Cooper Sanchez as the match remained level.

The opening minutes of the half passed without a clear chance, with both teams making substitutions before the next decisive action. Atlanta were firmly in control of the match, while Chattanooga were beginging to lose their composure.

Fafà Picault put Atlanta in front in the 64th minute, scoring to give the team its first lead of the match.

{% include quote.html
    mode=""
    quote="I think as we started to get a bit of rhythm, we started to understand the pitch was a bit different, and getting used to it as the game progressed was very important. We just got more comfortable and started to be more of ourselves."
    speaker="Fafà Picault, Atlanta United Forward"
    source="Post-match Press Conference"
    image="/images/quotes/Fafà Picault.jpg"
%}

{% include image_inline.html
   file="2026-04-15 - Amador 1.webp"
   caption="(Photo by Mitch Martin/Atlanta United)"
   align="right"
   height="500"
%}

Atlanta added a third goal in the 75th minute when Pedro Amador finished inside the box, extending the lead to two goals.

Luke Brennan replaced Almirón in the 71st minute after Almirón exited with knee discomfort. Miguel went directly down the tunnel after coming off.  

No further goals followed, and Atlanta finished the match with a much needed 3–1 win. 

{% include image_clear_floats.html %}

---
## {{ site.data.language.match_day_ending }}

Atlanta rotated players without changing how the team attacked. Cooper Sanchez and Miguel Almirón entered at halftime, Luke Brennan replaced Almirón after his exit, and late changes brought on Elías Báez and Tristan Muyumba. The same tactics remained in place across the subs.  That consistency pointed to a clear attacking idea that the group was able to carry out regardless of personnel.

{% include quote.html
    mode=""
    quote="It would have been very tempting for me during a run of negative results to use more of the players who normally play and we understood that we had to think not just in today’s game but all of the remaining games."
    speaker="Tata Martino, Atlanta United Head Coach"
    source="Post-match Press Conference"
    image="/images/quotes/Tata Martino.jpg"
%}


{% include centered_image.html
   file="2026-04-15 - Fortune 1.webp"
   caption="(Photo by Mitch Martin/Atlanta United)"
%}

Jay Fortune was the clear winner tonight. He showed how much he adds to Atlanta’s midfield by winning the ball and driving play forward.

The defensive issue remained. Chattanooga only needed one sequence into the space behind the fullbacks to score, and that same vulnerability appeared whenever Atlanta pushed numbers forward.

Jayden Hibbert did not face a high volume of difficult shots, but he controlled his area and avoided mistakes. He showed he can handle matches at this level, which increases the pressure on Lucas Hoyos to remain consistent in his role.

{% include quote.html
    mode=""
    quote="It shows a mental toughness because it’s not easy to go down - you can start to get in your head - but everybody stayed positive and we stuck together and got through it."
    speaker="Fafà Picault, Atlanta United Forward"
    source="Post-match Press Conference"
    image="/images/quotes/Fafà Picault.jpg"
%}
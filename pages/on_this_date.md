---
layout: default
title: "On This Date"
permalink: /on_this_date/
---

<div class="row t30">
  <div class="medium-10 columns medium-offset-1 end">

    {% assign Today_MD = site.time | date: "%m-%d" %}

    {% include section-heading.html title="On This Date" %}

    <p class="vip-muted">Today: {{ site.time | date: "%B %-d" }}</p>

    <!-- =================================================================== -->
    <!-- Games -->
    <!-- =================================================================== -->
    {% assign Games_Data = site.data.on_this_date.games %}
    {% if Games_Data and Games_Data.enabled %}
      {% assign Today_Games = Games_Data.games | where: "month_day", Today_MD %}

      <h3 class="t30">Games</h3>

      {% if Today_Games and Today_Games.size > 0 %}

        {% for Game in Today_Games %}
          <article class="on-this-date-card t10">

            <h4 class="on-this-date-title">
              {{ Game.title | default: "Historic Match" }}
            </h4>

            {% if Game.summary %}
              <div class="on-this-date-summary t5">
                {{ Game.summary | markdownify }}
              </div>
            {% endif %}

            <p class="on-this-date-muted t5">
              {{ Game.date_display }}{% if Game.year %}, {{ Game.year }}{% endif %}
              {% if Game.competition %} - {{ Game.competition }}{% endif %}
            </p>

            {% if Game.match %}
              {% assign M = Game.match %}

              {% assign Venue = M.venue | to_s | strip %}
              {% assign Team = M.team | to_s | strip %}
              {% assign Opponent = M.opponent | to_s | strip %}
              {% assign Result = M.result | to_s | strip %}
              {% assign Score = M.score | to_s | strip %}
              {% assign Round = M.round | to_s | strip %}
              {% assign Ref = M.ref | to_s | strip %}
              {% assign Day = M.day | to_s | strip %}
              {% assign Time = M.time | to_s | strip %}
              {% assign Possession = M.possession | to_s | strip %}
              {% assign Attendance = M.attendance | to_s | strip %}
              {% assign Captain = M.captain | to_s | strip %}
              {% assign Formation_Team = M.formation_team | to_s | strip %}
              {% assign Formation_Opponent = M.formation_opponent | to_s | strip %}
              {% assign Game_Type = M.game_type | to_s | strip %}
              {% assign xG = M.xg | to_s | strip %}
              {% assign xGA = M.xga | to_s | strip %}

              {% assign Has_GF = false %}
              {% if M.goals_for != nil %}
                {% assign Has_GF = true %}
              {% endif %}

              {% assign Has_GA = false %}
              {% if M.goals_against != nil %}
                {% assign Has_GA = true %}
              {% endif %}


              <div class="on-this-date-matchline t10">
                {% if Team != "" %}<span class="on-this-date-team">{{ Team }}</span>{% endif %}
                {% if Opponent != "" %}
                  <span class="on-this-date-at">at</span>
                  <span class="on-this-date-opponent">{{ Opponent }}</span>
                {% endif %}
                {% if Result != "" or Score != "" %}
                  <span class="on-this-date-sep">-</span>
                  {% if Result != "" %}<span class="on-this-date-result">{{ Result }}</span>{% endif %}
                  {% if Score != "" %}<span class="on-this-date-score">{{ Score }}</span>{% endif %}
                {% endif %}
              </div>

              {% assign Has_Any_Stat = false %}
              {% if Venue != "" or Round != "" or Ref != "" or Day != "" or Time != "" or Possession != "" or Attendance != "" or Captain != "" or Formation_Team != "" or Formation_Opponent != "" or Game_Type != "" or xG != "" or xGA != "" or Has_GF or Has_GA %}
                {% assign Has_Any_Stat = true %}
              {% endif %}

              {% if Has_Any_Stat %}
                <table class="on-this-date-stats-table t10">
                  <tbody>
                    {% if Venue != "" %}<tr><th>Venue</th><td>{{ Venue }}</td></tr>{% endif %}
                    {% if Round != "" %}<tr><th>Round</th><td>{{ Round }}</td></tr>{% endif %}

                    {% if Has_GF and Has_GA %}
                      <tr><th>GF / GA</th><td>{{ M.goals_for }} / {{ M.goals_against }}</td></tr>
                    {% elsif Has_GF %}
                      <tr><th>GF</th><td>{{ M.goals_for }}</td></tr>
                    {% elsif Has_GA %}
                      <tr><th>GA</th><td>{{ M.goals_against }}</td></tr>
                    {% endif %}

                    {% if xG != "" %}<tr><th>xG</th><td>{{ xG }}</td></tr>{% endif %}
                    {% if xGA != "" %}<tr><th>xGA</th><td>{{ xGA }}</td></tr>{% endif %}
                    {% if Possession != "" %}<tr><th>Possession</th><td>{{ Possession }}</td></tr>{% endif %}
                    {% if Attendance != "" %}<tr><th>Attendance</th><td>{{ Attendance }}</td></tr>{% endif %}

                    {% if Ref != "" %}<tr><th>Ref</th><td>{{ Ref }}</td></tr>{% endif %}
                    {% if Day != "" %}<tr><th>Day</th><td>{{ Day }}</td></tr>{% endif %}
                    {% if Time != "" %}<tr><th>Time</th><td>{{ Time }}</td></tr>{% endif %}

                    {% if Captain != "" %}<tr><th>Captain</th><td>{{ Captain }}</td></tr>{% endif %}
                    {% if Formation_Team != "" %}<tr><th>Formation</th><td>{{ Formation_Team }}</td></tr>{% endif %}
                    {% if Formation_Opponent != "" %}<tr><th>Opp Formation</th><td>{{ Formation_Opponent }}</td></tr>{% endif %}
                    {% if Game_Type != "" %}<tr><th>Type</th><td>{{ Game_Type }}</td></tr>{% endif %}
                  </tbody>
                </table>
              {% endif %}
            {% endif %}

            {% if Game.images %}
              <div class="on-this-date-image-row t10">
                {% for Img in Game.images limit:4 %}
                  <img class="on-this-date-thumb" src="{{ site.baseurl }}{{ Img }}" alt="" />
                {% endfor %}
              </div>
            {% endif %}
          </article>
        {% endfor %}

      {% else %}
        <p class="on-this-date-muted">No game loaded for today yet.</p>
      {% endif %}
    {% endif %}

    <!-- =================================================================== -->
    <!-- People -->
    <!-- =================================================================== -->
    {% assign People_Data = site.data.on_this_date.people %}
    {% if People_Data and People_Data.enabled %}
      {% assign Today_People = People_Data.people | where: "month_day", Today_MD %}

      <h3 class="t30">People</h3>

      {% if Today_People and Today_People.size > 0 %}
        <ul class="on-this-date-list">
          {% for P in Today_People %}
            <li>
              <strong>{{ P.name }}</strong>
              {% if P.event %} - {{ P.event }}{% endif %}
              {% if P.year %} ({{ P.year }}){% endif %}
            </li>
          {% endfor %}
        </ul>
      {% else %}
        <p class="on-this-date-muted">No people items for today yet.</p>
      {% endif %}
    {% endif %}

    <!-- =================================================================== -->
    <!-- Events -->
    <!-- =================================================================== -->
    {% assign Events_Data = site.data.on_this_date.events %}
    {% if Events_Data and Events_Data.enabled %}
      {% assign Today_Events = Events_Data.events | where: "month_day", Today_MD %}

      <h3 class="t30">Events</h3>

      {% if Today_Events and Today_Events.size > 0 %}
        {% for E in Today_Events %}
          <article class="on-this-date-card t10">
            <h4 class="on-this-date-title">{{ E.title }}</h4>
            {% if E.summary %}
              <div class="t10 on-this-date-summary">
                {{ E.summary | markdownify }}
              </div>
            {% endif %}
          </article>
        {% endfor %}
      {% else %}
        <p class="on-this-date-muted">No events for today yet.</p>
      {% endif %}
    {% endif %}

  </div>
</div>

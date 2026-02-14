---
layout: page_no_header
title: "Opponents Faced"
permalink: /opponents/

---

<div class="section-heading">
  <h1>Opponents Faced</h1>
</div>

{%- assign Opponents_Data = site.data.Opponents | default: site.data.opponents -%}

{%- assign Total_Opponents   = Opponents_Data | size -%}
{%- assign Total_Friendlies  = 0 -%}
{%- assign Total_MLS         = 0 -%}
{%- assign Total_US_Open_Cup = 0 -%}
{%- assign Total_Leagues_Cup = 0 -%}
{%- assign Total_CONCACAF    = 0 -%}
{%- assign Total_AmFamCup    = 0 -%}
{%- assign Total_Campeones   = 0 -%}
{%- assign Total_Other       = 0 -%}
{%- assign Countries_Seen    = "" -%}
{%- assign Total_Countries   = 0 -%}

{%- for Opponent in Opponents_Data -%}
  {%- assign M = Opponent.Matches -%}
  {%- if M -%}

    {%- assign FR = M.Friendlies  | default: 0 -%}
    {%- assign ML = M.MLS         | default: 0 -%}
    {%- assign OC = M.US_Open_Cup | default: 0 -%}
    {%- assign LC = M.Leagues_Cup | default: 0 -%}
    {%- assign CC = M.CONCACAF    | default: 0 -%}
    {%- assign AF = M.AmFamCup    | default: 0 -%}
    {%- assign CA = M.Campeones   | default: 0 -%}
    {%- assign OT = M.Other       | default: 0 -%}

    {%- assign Total_Friendlies  = Total_Friendlies  | plus: FR -%}
    {%- assign Total_MLS         = Total_MLS         | plus: ML -%}
    {%- assign Total_US_Open_Cup = Total_US_Open_Cup | plus: OC -%}
    {%- assign Total_Leagues_Cup = Total_Leagues_Cup | plus: LC -%}
    {%- assign Total_CONCACAF    = Total_CONCACAF    | plus: CC -%}
    {%- assign Total_AmFamCup    = Total_AmFamCup    | plus: AF -%}
    {%- assign Total_Campeones   = Total_Campeones   | plus: CA -%}
    {%- assign Total_Other       = Total_Other       | plus: OT -%}

    {%- assign CCODE = Opponent.Country_Code | default: "" -%}
    {%- if CCODE != "" -%}
      {%- assign Token = "|" | append: CCODE | append: "|" -%}
      {%- unless Countries_Seen contains Token -%}
        {%- assign Countries_Seen = Countries_Seen | append: Token -%}
        {%- assign Total_Countries = Total_Countries | plus: 1 -%}
      {%- endunless -%}
    {%- endif -%}

  {%- endif -%}
{%- endfor -%}

{%- assign Total_Matches = 0 -%}
{%- assign Total_Matches = Total_Matches | plus: Total_Friendlies -%}
{%- assign Total_Matches = Total_Matches | plus: Total_MLS -%}
{%- assign Total_Matches = Total_Matches | plus: Total_US_Open_Cup -%}
{%- assign Total_Matches = Total_Matches | plus: Total_Leagues_Cup -%}
{%- assign Total_Matches = Total_Matches | plus: Total_CONCACAF -%}
{%- assign Total_Matches = Total_Matches | plus: Total_AmFamCup -%}
{%- assign Total_Matches = Total_Matches | plus: Total_Campeones -%}
{%- assign Total_Matches = Total_Matches | plus: Total_Other -%}

<div class="home-card">
  <div class="home-card-title" style="margin-bottom:0.25rem;">
    Summary of ATLUTD Opponents
  </div>

  <div class="home-card-excerpt" style="margin-top:0;">
    <strong>{{ Total_Opponents }}</strong> opponents faced from <strong>{{ Total_Countries }}</strong> different nations<br/>
    Total matches (by competition buckets): <strong>{{ Total_Matches }}</strong>
  </div>

  <div class="home-card-meta" style="margin-top:0.4rem;">
    <strong>MLS:</strong> {{ Total_MLS }}
    <span class="home-card-separator">•</span>
    <strong>US Open Cup:</strong> {{ Total_US_Open_Cup }}
    <span class="home-card-separator">•</span>
    <strong>CONCACAF:</strong> {{ Total_CONCACAF }}
    <span class="home-card-separator">•</span>
    <strong>Leagues Cup:</strong> {{ Total_Leagues_Cup }}
    <span class="home-card-separator">•</span>
    <strong>Campeones:</strong> {{ Total_Campeones }}
    <span class="home-card-separator">•</span>
    <strong>AmFamCup:</strong> {{ Total_AmFamCup }}
    <span class="home-card-separator">•</span>
    <strong>Friendlies:</strong> {{ Total_Friendlies }}
  </div>
</div>


<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>

<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"
/>
<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"
/>


<div class="home-card">
  <div class="home-card-title" style="margin-bottom:0.25rem;">
    Explore the Map
  </div>

  <div class="home-card-excerpt" style="margin-top:0;">
    Search by opponent name, filter by country, then reset to return to the full view.
  </div>

  <div class="Map_Toolbar" style="margin-top:0.75rem;">
    <input id="Map_Search" type="text" placeholder="Search opponent..." />

    <select id="Country_Filter">
      <option value="">All countries</option>
    </select>

    <select id="Competition_Filter">
      <option value="">All competitions</option>
    </select>

    <button id="Map_Reset" type="button">Reset</button>
  </div>

  <div id="Warning"></div>

  <div id="Map_Container" class="Map_Container"></div>
</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>

{%- assign Opponents_Data = site.data.Opponents -%}
<script>
  window.Opponents_Map_Data = {{ Opponents_Data | jsonify }};
</script>

<script src="{{ '/assets/js/opponents.js' | relative_url }}"></script>
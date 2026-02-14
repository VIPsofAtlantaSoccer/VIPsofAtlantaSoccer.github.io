---
layout: page_no_header
title: "Where Are They Now?"
permalink: /where_are_they_now/
---

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

{%- assign Players_Data = site.data.Where_Are_They_Now | default: site.data.where_are_they_now -%}

<div class="section-heading">
  <h1>Where Are They Now?</h1>
</div>

<p class="Where_Intro">
  A living directory of former Atlanta United players - where they landed next, who retired, who moved into coaching or front offices,
  and who we’ve lost along the way. Players without GPS data are still counted in the totals, and will appear in the details section, but won’t appear on the map.
</p>

<div class="Map_Toolbar Where_Toolbar">
  <input id="Map_Search" type="text" placeholder="Search player name..." />

  <select id="Country_Filter">
    <option value="">All countries</option>
  </select>

  <select id="Status_Filter">
    <option value="">All statuses</option>
  </select>

  <select id="ATLUTD_Team_Filter">
    <option value="">All ATLUTD teams</option>
  </select>

  <button id="Map_Reset" type="button">Reset</button>
</div>

<div id="Warning"></div>

<div id="Map_Container" class="Map_Container"></div>

<div class="Opponents_Summary Where_Summary">
  <strong>Where Are They Now Summary</strong><br>

  Players tracked: <strong><span id="Where_Total_Players">0</span></strong><br>
  Countries represented: <strong><span id="Where_Total_Countries">0</span></strong><br>
  Players mapped ( GPS ): <strong><span id="Where_Total_Mapped">0</span></strong><br>
  ATLUTD teams represented: <strong><span id="Where_Total_ATLUTD_Teams">0</span></strong><br>

  <span style="opacity:0.9;">
    Active: <strong><span id="Where_Count_Active">0</span></strong> -
    Injured: <strong><span id="Where_Count_Injured">0</span></strong> -
    Retired: <strong><span id="Where_Count_Retired">0</span></strong> -
    Coach: <strong><span id="Where_Count_Coach">0</span></strong> -
    Front Office: <strong><span id="Where_Count_Front_Office">0</span></strong> -
    Media: <strong><span id="Where_Count_Media">0</span></strong> -
    Passed Away: <strong><span id="Where_Count_Passed_Away">0</span></strong>
    <span id="Where_Unknown_Wrap" style="display:none;">
      - Unknown: <strong><span id="Where_Count_Unknown">0</span></strong>
    </span>
  </span>
</div>

<hr>

<div class="Where_Details">
  <div class="Where_Details_Header">
    <h2>Details</h2>
    <div class="Where_Details_Subtitle">
      Grouped lists - useful for spot-checking data without opening JSON. This section updates with your filters.
    </div>
  </div>

  <div id="Where_Details_Container"></div>
</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>

<script>
  window.Where_Are_They_Now_Players = {{ Players_Data | jsonify }};
</script>

<script src="{{ '/assets/js/where_are_they_now.js' | relative_url }}"></script>

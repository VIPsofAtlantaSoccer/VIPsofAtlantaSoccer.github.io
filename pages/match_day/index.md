---
layout: page_no_header
title: "Match Day"
teaser: "Match notes, previews, and recaps."
permalink: /match_day/
header:
    background-color: "#221F1F;"
---


<div class="row">

  {% include section-heading.html
    title=site.data.language.match_day_list
    subtitle=site.data.language.match_day_list_subheading
  %}

  <div class="medium-12 columns">
    {% include _content_match_day_list.html %}
  </div>

</div>

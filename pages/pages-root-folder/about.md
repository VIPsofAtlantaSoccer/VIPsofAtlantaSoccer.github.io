---
layout: page
title: "About VIPs of Atlanta Soccer"
permalink: "/about/"
timezone: America/New_York
Last_Updated: 2025-11-30
---

**VIPs of Atlanta Soccer** is independently operated by an analyst, archivist, and long-time supporter of soccer.  It was created during the early months of COVID - a time when everyone was stuck at home looking for something productive to focus on. What started as a simple project to organize match stats quickly turned into a long-term effort to document Atlanta United in a clear, accurate, and meaningful way.



Today, **VIPs of Atlanta Soccer** brings together analysis, research, historical archiving, and original writing to give supporters a reliable place to learn more about the club.

## What This Site is About ##

This site brings together multiple ongoing projects, including:
* Match Analysis and Reporting
* Tracking current and former players
* Detailed match reports for Atlanta United and related competitions
* Player-specific breakdowns, including xG, duels, key actions, and other advanced metrics
* In-game commentary
* Post-match Articles built from a balanced perspective

**VIPs of Atlanta Soccer** aims to create a dependable, fact-based resource for Atlanta United supporters - something that documents the club’s past and present without noise, speculation, or shortcuts.

### Match Reports and Analysis ###
You’ll find data-driven match breakdowns, player highlights, trends, and performance insights - all created from custom tools and scripts developed specifically for this project.

### Historical Projects ###
A major part of **VIPs of Atlanta Soccer** is preserving the full history of the club:

* A long-term project to rebuild and verify Atlanta United’s complete match history
* Manager timelines, performance charts, and competition-specific records
* Archiving of rosters, staff, player bios, and statistical profiles

### How the Site Works ###
Much of the site is powered by custom-built tools designed specifically for this project.  These handle tasks such as:
* Collecting and validating match data  
* Organizing images and media  
* Maintaining a structured archive of club history

It’s an ongoing process, and the goal is to eventually have a complete historical reference available for supporters.
This infrastructure allows the project to stay consistent, and sustainable, while remaining fully independent.

### Articles and Features ###

Beyond stats and reports, **VIPs of Atlanta Soccer** publishes produces long-form articles about:
* Key moments in club history
* Player stories
* Tactical and roster-building trends
* Broader Atlanta soccer culture, including the return of professional women’s soccer to the city

### The Goal ###

Atlanta United has quickly built one of the strongest soccer identities in the United States.
The goal of **VIPs of Atlanta Soccer** is to preserve that story — and provide resources that help supporters understand the full picture, not just match by match but across seasons and years.

### Thank You ###

If you’ve taken the time to visit the site, read an article, follow on social media, or share any of the work - thank you.
This project has grown far beyond its original scope, and it’s only possible because people care enough to follow along.

Your support makes it worth continuing to build, expand, and improve.

{% assign aff_list = site.data.affiliations | default: empty %}
{% if aff_list and aff_list.size > 0 %}

### Related Projects & Affiliations

<div class="affiliation-block">
  {% for Affiliate in aff_list %}

    {% if Affiliate.About_Page %}
    <div class="affiliation-item">
    <div class="affiliation-logo-frame">
        <a href="{{ Affiliate.url }}" target="_blank" class="affiliation-logo-link">
        <img src="{{ Affiliate.logo }}"
            alt="{{ Affiliate.name }} logo"
            class="affiliation-logo">
        </a>
    </div>

    <p class="affiliation-text">
        {% if Affiliate.url %}
          <strong><a href="{{ Affiliate.url }}" target="_blank">{{ Affiliate.name }}</a></strong>
        {% else %}
          <strong>{{ Affiliate.name }}</strong>
        {% endif %}

        {% if Affiliate.role %}
          <span class="affiliation-role"> - {{ Affiliate.role }}</span>
        {% endif %}

        {% if Affiliate.description %}
          <br>{{ Affiliate.description }}
        {% endif %}
    </p>
    </div>
    {% endif %}

  {% endfor %}
</div>

{% endif %}

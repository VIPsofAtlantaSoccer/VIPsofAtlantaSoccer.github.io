---
layout: page
title: Categories
permalink: /categories/
---

{% assign Category_Documents = site.content_articles | concat: site.content_match_days | concat: site.posts %}

{% assign Category_List_Text = "" %}

{% for Document in Category_Documents %}
	{% if Document.published != false and Document.categories %}
		{% for Category in Document.categories %}
			{% assign Category_Clean = Category | strip %}

			{% if Category_Clean != "" %}
				{% capture Category_List_Text %}{{ Category_List_Text }}{{ Category_Clean }}||{% endcapture %}
			{% endif %}
		{% endfor %}
	{% endif %}
{% endfor %}

{% assign Category_List = Category_List_Text | split: "||" | uniq | sort %}

<div class="category-index">

	<div class="category-index-header">
		<h2>All Categories</h2>
		<p>Select a category to view matching articles and match-day coverage.</p>
	</div>

	<div class="category-index-pill-list">
		{% for Category in Category_List %}
			{% if Category != "" %}

				{% assign Category_Display = Category %}
				{% assign Category_Class = "category-index-pill category-pill" %}
				{% assign Matched_Team = nil %}

				{% for Team in site.data.Team_Names %}
					{% if Team.Categories contains Category %}
						{% assign Matched_Team = Team %}
						{% break %}
					{% endif %}
				{% endfor %}

				{% if Matched_Team %}
					{% assign Category_Display = Matched_Team.Display %}
					{% assign Category_Class = "category-index-pill category-pill category-team" | append: " " | append: Matched_Team.Class %}
				{% endif %}

				<!--<a class="{{ Category_Class }}" href="#{{ Category | slugify }}">{{ Category_Display }}</a>-->

                {% assign Category_Count = 0 %}

                {% for Document in Category_Documents %}
                    {% if Document.published != false and Document.categories contains Category %}
                        {% assign Category_Count = Category_Count | plus: 1 %}
                    {% endif %}
                {% endfor %}

                <a class="{{ Category_Class }}" href="#{{ Category | slugify }}">
                    <span class="category-index-pill-label">{{ Category_Display }}</span>
                    <span class="category-index-pill-count">{{ Category_Count }}</span>
                </a>

			{% endif %}
		{% endfor %}
	</div>

	{% for Category in Category_List %}
		{% if Category != "" %}

			{% assign Category_Display = Category %}
			{% assign Matched_Team = nil %}

			{% for Team in site.data.Team_Names %}
				{% if Team.Categories contains Category %}
					{% assign Matched_Team = Team %}
					{% break %}
				{% endif %}
			{% endfor %}

			{% if Matched_Team %}
				{% assign Category_Display = Matched_Team.Display %}
			{% endif %}

            <section id="{{ Category | slugify }}" class="category-section">

                {% assign Category_Count = 0 %}

                {% for Document in Category_Documents %}
                    {% if Document.published != false and Document.categories contains Category %}
                        {% assign Category_Count = Category_Count | plus: 1 %}
                    {% endif %}
                {% endfor %}

                <h2>
                    <span class="category-section-title">{{ Category_Display }}</span>
                    <span class="category-section-count">{{ Category_Count }} items</span>
                </h2>

                {% assign Has_Matching_Documents = false %}

				<div class="category-index-article-list">
					{% for Document in Category_Documents reversed %}
						{% if Document.published != false and Document.categories contains Category %}
							{% assign Has_Matching_Documents = true %}

							<article class="category-index-article-card">
								<h3>
									<a href="{{ Document.url | relative_url }}">{{ Document.title }}</a>
								</h3>

								{% if Document.date %}
									<div class="category-index-article-date">
										{{ Document.date | date: "%Y-%m-%d" }}
									</div>
								{% endif %}

								{% if Document.teaser %}
									<p>{{ Document.teaser }}</p>
								{% endif %}
							</article>

						{% endif %}
					{% endfor %}
				</div>

				{% if Has_Matching_Documents == false %}
					<p>No articles found.</p>
				{% endif %}

			</section>

		{% endif %}
	{% endfor %}

</div>
---
layout: page_no_header
title: "ATLUTD Timeline"
subheadline: "Key moments in club history, players, and culture"
permalink: "/timeline/"
image_dir: ""
image:
    title: Evolution_Soccer.jpg
    thumb: Evolution_Soccer.jpg
    homepage: Evolution_Soccer.jpg
    caption: ""

---

  {% include section-heading.html
    title=site.data.language.timeline_title
    subtitle=site.data.language.timeline_subheading
  %}

{% assign timeline_data = site.data.timeline %}
{% assign filters      = timeline_data.filters %}
{% assign events       = timeline_data.events | sort: "date" %}
{% assign events_by_year = events | group_by_exp: "item", "item.date | slice: 0,4" %}

<!-- Search + Year controls -->
<div class="timeline-controls">
    <input type="text"
           class="timeline-search-input"
           placeholder="Search timeline..."
           data-timeline-search />

    <select class="timeline-year-select" data-timeline-year>
        <option value="all">All years</option>
        {% for year_group in events_by_year %}
          <option value="{{ year_group.name }}">{{ year_group.name }}</option>
        {% endfor %}
    </select>

</div>

<!-- Filter buttons -->
<div class="timeline-filters">
  <button type="button" class="timeline-filter-button active" data-timeline-filter="all">
    All
  </button>

  {% for Filter in filters %}
    <button type="button" class="timeline-filter-button" data-timeline-filter="{{ Filter.key }}" 
            style="--timeline-cat-color: {{ Filter.color }};">
      {% if Filter.icon %}
        <span class="timeline-filter-icon">{{ Filter.icon }}</span>
      {% endif %}
      {{ Filter.label }}
    </button>
  {% endfor %}
</div>


<div class="timeline">
  {% for year_group in events_by_year %}
    <div class="timeline-year-block" data-year="{{ year_group.name }}">

      <h2 class="timeline-year-heading" id="year-{{ year_group.name }}">
        {{ year_group.name }}
      </h2>

      {% for event in year_group.items %}
        <div class="timeline-item importance-{{ event.importance }} timeline-item-{{ event.category | downcase }}"
             data-category="{{ event.category | downcase }}">

          <div class="timeline-content">
            <div class="timeline-date">
              {{ event.date }}
            </div>

            <h3 class="timeline-title">
              {% if event.url %}
                <a href="{{ event.url }}">{{ event.title }}</a>
              {% else %}
                {{ event.title }}
              {% endif %}
            </h3>

            {% if event.category or event.type %}
              <div class="timeline-meta">

                {% if event.category %}
                  {% assign category_key = event.category | downcase %}
                  {% assign Category_Filter = filters | where: "key", category_key | first %}

                  <span class="timeline-chip timeline-chip-category"
                        data-category="{{ category_key }}"
                        style="--timeline-cat-color: {{ Category_Filter.color }}">
                    {% if Category_Filter.icon %}
                      <span class="timeline-chip-icon">{{ Category_Filter.icon }}</span>
                    {% endif %}
                    {{ event.category }}
                  </span>
                {% endif %}

                {% if event.type %}
                  <span class="timeline-chip timeline-chip-type timeline-chip-type-{{ event.type | downcase }}">
                    {{ event.type }}
                  </span>
                {% endif %}

              </div>
            {% endif %}



            {% if event.subtitle %}
              <div class="timeline-subtitle">
                {{ event.subtitle }}
              </div>
            {% endif %}

            {% if event.details %}
              <p class="timeline-details">
                {{ event.details }}
              </p>
            {% endif %}

            {% if event.images %}
              <div class="timeline-images" data-random-images="4">
                {% for img in event.images %}
                  <figure class="timeline-image-wrapper">
                    <img src="{{ event.image_dir }}/{{ img }}" alt="{{ event.title }}" class="timeline-image">
                  </figure>
                {% endfor %}
              </div>
            {% endif %}


          </div>
        </div>

      {% endfor %}
    </div>

    {% unless forloop.last %}
      <hr/>
    {% endunless %}

{% endfor %}

</div>

<script src="{{ '/assets/js/timeline.js' | relative_url }}"></script>
<script src="{{ '/assets/js/random-images.js' | relative_url }}"></script>
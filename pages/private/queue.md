---
layout: page_no_header
title: "Article Queue"
permalink: /private/queue/
---

<h1>{{ page.title }}</h1>

{% assign Queue = site.data.queue | default: empty %}
{% assign Total_Count = Queue | size %}

{% assign Status_List = "" | split: "" %}
{% assign Category_List = "" | split: "" %}
{% assign Priority_List = "" | split: "" %}
{% assign Author_List = "" | split: "" %}

{%- comment -%}
  Build filter lists.
  If Item.article_path exists, pull values from the collection doc front matter.
  Otherwise, use the inline queue values.
{%- endcomment -%}
{% for Item in Queue %}

  {% assign Doc = nil %}
  {% if Item.article_path %}
    {% assign Doc = site.content_articles | where_exp: "d", "d.path == Item.article_path" | first %}
  {% endif %}

  {% assign Status_Text = "" %}
  {% assign Priority_Text = "" %}
  {% assign Author_Text = "" %}
  {% assign Categories_Array = "" | split: "" %}

  {% if Doc %}
    {% assign Status_Text = Doc.status | default: Doc.data.status | default: "" %}
    {% assign Priority_Text = Doc.priority | default: Doc.data.priority | default: "" %}
    {% assign Author_Text = Doc.author | default: Doc.data.author | default: "" %}

    {% if Doc.categories %}
      {% assign Categories_Array = Doc.categories %}
    {% elsif Doc.data.categories %}
      {% assign Categories_Array = Doc.data.categories %}
    {% elsif Doc.category %}
      {% assign Categories_Array = Doc.category %}
    {% elsif Doc.data.category %}
      {% assign Categories_Array = Doc.data.category %}
    {% endif %}

  {% else %}
    {% assign Status_Text = Item.status | default: "" %}
    {% assign Priority_Text = Item.priority | default: "" %}
    {% assign Author_Text = Item.author | default: "" %}
    {% assign Categories_Array = Item.category | default: "" %}
  {% endif %}

  {% if Status_Text != "" %}{% assign Status_List = Status_List | push: Status_Text %}{% endif %}
  {% if Priority_Text != "" %}{% assign Priority_List = Priority_List | push: Priority_Text %}{% endif %}
  {% if Author_Text != "" %}{% assign Author_List = Author_List | push: Author_Text %}{% endif %}

  {%- comment -%} Normalize categories into a list {%- endcomment -%}
  {% if Categories_Array %}
    {% if Categories_Array.first %}
      {% for Cat in Categories_Array %}
        {% if Cat %}{% assign Category_List = Category_List | push: Cat %}{% endif %}
      {% endfor %}
    {% else %}
      {% assign Category_List = Category_List | push: Categories_Array %}
    {% endif %}
  {% endif %}

{% endfor %}

{% assign Status_List = Status_List | uniq | sort %}
{% assign Category_List = Category_List | uniq | sort %}
{% assign Priority_List = Priority_List | uniq | sort %}
{% assign Author_List = Author_List | uniq | sort %}

<div class="Queue-controls">
  <label>
    Status
    <select id="Queue_Filter_Status">
      <option value="">All</option>
      {% for S in Status_List %}
        <option value="{{ S | escape }}">{{ S }}</option>
      {% endfor %}
    </select>
  </label>

  <label>
    Category
    <select id="Queue_Filter_Category">
      <option value="">All</option>
      {% for C in Category_List %}
        <option value="{{ C | escape }}">{{ C }}</option>
      {% endfor %}
    </select>
  </label>

  <label>
    Priority
    <select id="Queue_Filter_Priority">
      <option value="">All</option>
      {% for P in Priority_List %}
        <option value="{{ P | escape }}">{{ P }}</option>
      {% endfor %}
    </select>
  </label>

  <label>
    Author
    <select id="Queue_Filter_Author">
      <option value="">All</option>
      {% for A in Author_List %}
        <option value="{{ A | escape }}">{{ A }}</option>
      {% endfor %}
    </select>
  </label>

  <label>
    Search
    <input id="Queue_Filter_Search" type="text" placeholder="title, notes..." />
  </label>

  <label class="Queue-checkbox">
    <input id="Queue_Show_Published" type="checkbox" />
    Show Published
  </label>
</div>

<div class="Queue-summary" id="Queue_Summary">
  <span class="Queue-pill">Total: <strong id="Queue_Total_Count">{{ Total_Count }}</strong></span>

  {% for S in Status_List %}
    {% assign Count = 0 %}
    {% for Item in Queue %}
      {% assign Doc = nil %}
      {% if Item.article_path %}
        {% assign Doc = site.content_articles | where_exp: "d", "d.path == Item.article_path" | first %}
      {% endif %}
      {% assign Row_Status = Item.status | default: "" %}
      {% if Doc %}
        {% assign Row_Status = Doc.status | default: Doc.data.status | default: Row_Status %}
      {% endif %}
      {% if Row_Status == S %}{% assign Count = Count | plus: 1 %}{% endif %}
    {% endfor %}

    <span class="Queue-pill" data-status="{{ S | xml_escape }}">
      {{ S }}: <strong class="Queue_Status_Count">{{ Count }}</strong>
    </span>
  {% endfor %}
</div>

<div class="Queue-list" id="Queue_List">
  {% for Item in Queue %}

    {% assign Doc = nil %}
    {% if Item.article_path %}
      {% assign Doc = site.content_articles | where_exp: "d", "d.path == Item.article_path" | first %}
    {% endif %}

    {%- comment -%} Fields - doc first, then queue fallback {%- endcomment -%}
    {% assign Title_Text = Item.title | default: "" %}
    {% assign Notes_Text = Item.notes | default: "" %}
    {% assign Status_Text = Item.status | default: "" %}
    {% assign Priority_Text = Item.priority | default: "" %}
    {% assign Author_Text = Item.author | default: "" %}
    {% assign Categories_Array = Item.category | default: "" %}
    {% assign Blocking_Array = Item.blocking | default: empty %}
    {% assign Dates_Array = Item.dates | default: empty %}
    {% assign Post_Url = Item.post_url | default: "" %}

    {% assign Published_Flag = false %}
    {% if Item.published == true %}{% assign Published_Flag = true %}{% endif %}

    {% assign Subheadline_Text = Item.subheadline | default: "" %}
    {% assign Teaser_Text = Item.teaser | default: "" %}

    {% if Doc %}
      {% assign Title_Text = Doc.title | default: Doc.data.title | default: Title_Text %}
      {% assign Status_Text = Doc.status | default: Doc.data.status | default: Status_Text %}
      {% assign Priority_Text = Doc.priority | default: Doc.data.priority | default: Priority_Text %}
      {% assign Author_Text = Doc.author | default: Doc.data.author | default: Author_Text %}
      {% assign Notes_Text = Doc.notes | default: Doc.data.notes | default: Notes_Text %}
      {% assign Blocking_Array = Doc.blocking | default: Doc.data.blocking | default: Blocking_Array %}
      {% assign Dates_Array = Doc.dates | default: Doc.data.dates | default: Dates_Array %}
      {% assign Categories_Array = Doc.categories
        | default: Doc.data.categories
        | default: Doc.category
        | default: Doc.data.category
        | default: Categories_Array %}

      {% assign Post_Url = Doc.url | default: Post_Url %}

      {% assign Subheadline_Text = Doc.subheadline | default: Doc.data.subheadline | default: Subheadline_Text %}
      {% assign Teaser_Text = Doc.teaser | default: Doc.data.teaser | default: Teaser_Text %}

      {% assign Published_Flag = false %}
      {% if Doc.published == true %}{% assign Published_Flag = true %}{% endif %}
      {% if Doc.data.published == true %}{% assign Published_Flag = true %}{% endif %}
    {% endif %}

    {%- comment -%} Categories -> display + filter string {%- endcomment -%}
    {% assign Categories_Text = "" %}
    {% assign Categories_Filter_Text = "" %}

    {% if Categories_Array %}
      {% if Categories_Array.first %}
        {% assign Categories_Text = Categories_Array | join: ", " %}
        {% assign Categories_Filter_Text = Categories_Array | join: "|" | downcase %}
      {% else %}
        {% assign Categories_Text = Categories_Array %}
        {% assign Categories_Filter_Text = Categories_Text | downcase %}
      {% endif %}
    {% endif %}

    {% assign Search_Text = Title_Text
      | append: " "
      | append: Notes_Text
      | append: " "
      | append: Author_Text
      | append: " "
      | append: Categories_Text
      | downcase
      | strip_newlines %}

    {% assign Priority_Class = Priority_Text | downcase | replace: " ", "-" %}
    {% assign Status_Class = Status_Text | downcase | replace: " ", "-" %}

    {%- comment -%} Sorting knobs {%- endcomment -%}
    {% assign Sort_Priority = 9 %}
    {% if Priority_Text == "High" %}{% assign Sort_Priority = 1 %}{% endif %}
    {% if Priority_Text == "Medium" %}{% assign Sort_Priority = 2 %}{% endif %}
    {% if Priority_Text == "Low" %}{% assign Sort_Priority = 3 %}{% endif %}

    {% assign Sort_Status = 9 %}
    {% if Status_Text == "Waiting" %}{% assign Sort_Status = 1 %}{% endif %}
    {% if Status_Text == "Written" %}{% assign Sort_Status = 2 %}{% endif %}
    {% if Status_Text == "Idea" %}{% assign Sort_Status = 3 %}{% endif %}
    {% if Status_Text == "Researching" %}{% assign Sort_Status = 4 %}{% endif %}
    {% if Status_Text == "Drafting" %}{% assign Sort_Status = 5 %}{% endif %}
    {% if Status_Text == "Editing" %}{% assign Sort_Status = 6 %}{% endif %}
    {% if Status_Text == "Scheduled" %}{% assign Sort_Status = 7 %}{% endif %}
    {% if Status_Text == "Published" %}{% assign Sort_Status = 8 %}{% endif %}

    <div class="Queue_Item Queue-item"
         data-published="{{ Published_Flag }}"
         data-status="{{ Status_Text | xml_escape }}"
         data-priority="{{ Priority_Text | xml_escape }}"
         data-author="{{ Author_Text | xml_escape }}"
         data-categories="{{ Categories_Filter_Text | xml_escape }}"
         data-search="{{ Search_Text | xml_escape }}"
         data-sort-priority="{{ Sort_Priority }}"
         data-sort-title="{{ Title_Text | downcase | xml_escape }}"
         data-sort-status="{{ Sort_Status }}">

      <div class="Queue-card" data-priority="{{ Priority_Class }}">

        <div class="Queue-card-grid">

          <div class="Queue-card-main">

            <div class="Queue-card-title">
              {% if Post_Url != "" %}
                <a href="{{ Post_Url | relative_url }}">{{ Title_Text }}</a>
              {% else %}
                {{ Title_Text }}
              {% endif %}
            </div>

            <div class="Queue-submeta">
              {% if Author_Text != "" %}
                <span class="Queue-muted">Author:</span> <strong>{{ Author_Text }}</strong>
              {% endif %}

              {% if Categories_Text != "" %}
                {% if Author_Text != "" %} <span class="Queue-muted" style="margin:0 0.35rem;">•</span> {% endif %}
                <span class="Queue-muted">Categories:</span> <strong>{{ Categories_Text }}</strong>
              {% endif %}
            </div>

            {% if Teaser_Text != "" %}
              <div class="Queue-teaser">{{ Teaser_Text }}</div>
            {% elsif Subheadline_Text != "" %}
              <div class="Queue-teaser">{{ Subheadline_Text }}</div>
            {% endif %}

            <div class="Queue-card-meta">
              <span class="Queue-priority" data-priority="{{ Priority_Class }}">
                {{ Priority_Text }}
              </span>

              <span class="Queue-status Queue-status-{{ Status_Class }}">Status: {{ Status_Text }}</span>

              {% if Published_Flag %}
                <span class="Queue-status" style="border-color: rgba(0,120,0,0.35); background: rgba(0,120,0,0.06);">State: Published</span>
              {% else %}
                <span class="Queue-status">State: Unpublished</span>
              {% endif %}
            </div>

            {% assign Image_Thumb = "" %}

            {% if Doc and Doc.image %}
              {% assign Image_Thumb = Doc.image.thumb | default: Doc.image.homepage | default: Doc.image.title | default: "" %}
            {% elsif Item.image %}
              {% assign Image_Thumb = Item.image.thumb | default: Item.image.homepage | default: Item.image.title | default: "" %}
            {% endif %}

            {% if Image_Thumb != "" %}
              <div class="Queue-thumb">
                <img src="{{ site.urlimg }}{{ Image_Thumb }}" alt="{{ Title_Text | escape_once }}" loading="lazy" />
              </div>
            {% endif %}

            {% if Blocking_Array and Blocking_Array.size > 0 %}
              <div class="Queue-blocked">
                <div class="Queue-blocked-title">WAITING ON</div>
                <ul class="Queue-blocked-list">
                  {% for B in Blocking_Array %}
                    <li>{{ B }}</li>
                  {% endfor %}
                </ul>
              </div>
            {% endif %}

            {% if Notes_Text != "" %}
              <div class="Queue-notes">{{ Notes_Text }}</div>
            {% endif %}

          </div>

          <div class="Queue-card-dates">
            <div class="Queue-dates-title">Dates</div>

            <ul class="Queue-dates">
              {% if Dates_Array and Dates_Array.size > 0 %}
                {% for D in Dates_Array %}
                  {% assign L = D.label | default: "" %}
                  {% assign V = D.date | default: "" %}
                  {% if L != "" and V != "" %}
                    <li>
                      <span class="Queue-date-value">{{ V }}:</span>
                      <span class="Queue-date-label">{{ L }}</span>
                    </li>
                  {% endif %}
                {% endfor %}
              {% endif %}
            </ul>
          </div>

        </div>

      </div>

    </div>

  {% endfor %}
</div>

<script src="{{ '/assets/js/queue.js' | relative_url }}"></script>

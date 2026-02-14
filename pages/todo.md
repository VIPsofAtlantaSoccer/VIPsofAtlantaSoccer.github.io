---
layout: page
title: "To Do List"
subheadline: "Changes which are thought about but may not come to pass"
teaser: "Things I've thought about adding to the site.  In no particular order..."
permalink: "/todo/"
header:
    #image_fullwidth: "examples/header_drop.jpg"
    background-color:  "#221F1F;"

---

### {{site.data.language.todo_list}} ###


<table class="todo-table">
  <thead>
    <tr>
      <th>Category</th>
      <th>Item</th>
      <th>Icons</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>

    {% for block in site.data.todo.todo %}
      {% include todo_category.html category=block.category %}

      {% for task in block.items %}
        {% include todo_item.html
           item=task.item
           statuses=task.statuses
           notes=task.notes %}
      {% endfor %}
    {% endfor %}

  </tbody>
</table>



### Completed Tasks ###
<table class="todo-table">
  <thead>
    <tr>
      <th>Category</th>
      <th>Item</th>
      <th>Icons</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>

    {% for block in site.data.todo.completed %}
      {% include todo_category.html category=block.category %}

      {% for task in block.items %}
        {% include todo_item.html
           item=task.item
           statuses=task.statuses
           notes=task.notes %}
      {% endfor %}
    {% endfor %}

  </tbody>
</table>
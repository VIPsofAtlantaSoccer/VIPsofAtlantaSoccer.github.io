(function () {
  // Find the container on the page
  var container = document.getElementById("changelog");
  if (!container) {
    return;
  }

  var owner = container.getAttribute("data-owner") || "ATLUTDVIPs";
  var repo = container.getAttribute("data-repo") || "ATLUTDVIPs.github.io";
  var branch = container.getAttribute("data-branch") || "main";
  var maxCommits = parseInt(container.getAttribute("data-max") || "20", 10);

  var apiUrl = "https://api.github.com/repos/"
    + encodeURIComponent(owner)
    + "/"
    + encodeURIComponent(repo)
    + "/commits?sha="
    + encodeURIComponent(branch)
    + "&per_page="
    + maxCommits;

  container.innerHTML = "<p>Loading recent changes…</p>";

  fetch(apiUrl)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("GitHub API error: " + response.status);
      }
      return response.json();
    })
    .then(function (commits) {
      if (!Array.isArray(commits) || commits.length === 0) {
        container.innerHTML = "<p>No recent commits found.</p>";
        return;
      }

      var list = document.createElement("ul");
      list.className = "changelog-list";

      commits.forEach(function (commit) {
        var li = document.createElement("li");
        li.className = "changelog-item";

        var commitInfo = commit.commit || {};
        var author = commitInfo.author || {};
        var message = (commitInfo.message || "").split("\n")[0]; // first line only
        var dateStr = author.date || commitInfo.committer && commitInfo.committer.date || "";
        var date = dateStr ? new Date(dateStr) : null;

        // Commit URL on GitHub
        var htmlUrl = commit.html_url || (
          "https://github.com/" + owner + "/" + repo + "/commit/" + commit.sha
        );

        var header = document.createElement("div");
        header.className = "changelog-header";

        var msgLink = document.createElement("a");
        msgLink.href = htmlUrl;
        msgLink.target = "_blank";
        msgLink.rel = "noopener noreferrer";
        msgLink.className = "changelog-message";
        msgLink.textContent = message || "(no commit message)";

        header.appendChild(msgLink);

        var meta = document.createElement("div");
        meta.className = "changelog-meta";

        if (date) {
          var options = { year: "numeric", month: "short", day: "2-digit" };
          var dateText = date.toLocaleDateString(undefined, options);
          meta.textContent = dateText;
        }

        if (commit.author && commit.author.login) {
          var authorSpan = document.createElement("span");
          authorSpan.className = "changelog-author";
          authorSpan.textContent = " · " + commit.author.login;
          meta.appendChild(authorSpan);
        }

        li.appendChild(header);
        li.appendChild(meta);
        list.appendChild(li);
      });

      container.innerHTML = "";
      container.appendChild(list);
    })
    .catch(function (err) {
      console.error(err);
      container.innerHTML = "<p>Could not load recent changes (GitHub API error).</p>";
    });
})();

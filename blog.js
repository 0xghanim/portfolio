(function () {
  "use strict";

  const grid = document.getElementById("blog-grid");
  const config = window.PORTFOLIO_CONFIG;
  if (!grid || !config) return;

  const mediumProfile = config.links.medium;
  const feedUrl = `https://${config.mediumUsername}.medium.com/feed`;
  const rss2JsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
  const allOriginsUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;

  function textFromHtml(html) {
    const documentFragment = new DOMParser().parseFromString(html || "", "text/html");
    return (documentFragment.body.textContent || "").replace(/\s+/g, " ").trim();
  }

  function imageFromHtml(html) {
    const documentFragment = new DOMParser().parseFromString(html || "", "text/html");
    return documentFragment.querySelector("img")?.src || "";
  }

  function formatDate(date) {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "Recent";
    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(parsed);
  }

  function addText(parent, tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    parent.appendChild(element);
    return element;
  }

  function renderPosts(posts) {
    grid.replaceChildren();
    grid.setAttribute("aria-busy", "false");

    if (!posts.length) {
      renderError("No Medium posts were found yet.");
      return;
    }

    const newestFirst = [...posts].sort((firstPost, secondPost) => {
      const firstDate = new Date(firstPost.pubDate).getTime() || 0;
      const secondDate = new Date(secondPost.pubDate).getTime() || 0;
      return secondDate - firstDate;
    });

    newestFirst.slice(0, 9).forEach((post) => {
      const link = document.createElement("a");
      link.className = "blog-card";
      link.href = post.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      const imageUrl = post.thumbnail || imageFromHtml(post.content);
      if (imageUrl) {
        const image = document.createElement("img");
        image.className = "blog-thumbnail";
        image.src = imageUrl;
        image.alt = "";
        image.loading = "lazy";
        image.addEventListener("error", () => image.remove());
        link.appendChild(image);
      }

      const body = document.createElement("div");
      body.className = "blog-card-body";
      addText(body, "h2", "blog-title", post.title || "Untitled write-up");

      const excerpt = textFromHtml(post.content || post.description).slice(0, 190);
      addText(body, "p", "blog-description", excerpt ? `${excerpt}...` : "Open this write-up on Medium.");

      const meta = document.createElement("div");
      meta.className = "blog-meta";
      addText(meta, "span", "", formatDate(post.pubDate));
      addText(meta, "span", "", "READ ON MEDIUM ->");
      body.appendChild(meta);
      link.appendChild(body);
      grid.appendChild(link);
    });
  }

  function renderError(message) {
    grid.replaceChildren();
    grid.setAttribute("aria-busy", "false");
    const state = document.createElement("div");
    state.className = "state-message";
    state.append(document.createTextNode(`[!] ${message} `));
    const link = document.createElement("a");
    link.href = mediumProfile;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open 0xGhanim on Medium";
    state.appendChild(link);
    grid.appendChild(state);
  }

  async function fetchRss2Json() {
    const response = await fetch(rss2JsonUrl);
    if (!response.ok) throw new Error("rss2json request failed");
    const data = await response.json();
    if (data.status !== "ok") throw new Error(data.message || "Invalid RSS response");
    const posts = data.items.map((item) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      content: item.content || item.description,
      thumbnail: item.thumbnail
    }));
    if (!posts.length) throw new Error("Medium feed returned no posts");
    return posts;
  }

  async function fetchAllOrigins() {
    const response = await fetch(allOriginsUrl);
    if (!response.ok) throw new Error("RSS fallback request failed");
    const xmlText = await response.text();
    const xml = new DOMParser().parseFromString(xmlText, "text/xml");
    if (xml.querySelector("parsererror")) throw new Error("RSS parsing failed");

    return Array.from(xml.querySelectorAll("item")).map((item) => {
      const content = item.getElementsByTagName("content:encoded")[0]?.textContent
        || item.querySelector("description")?.textContent
        || "";
      return {
        title: item.querySelector("title")?.textContent || "Untitled write-up",
        link: item.querySelector("link")?.textContent || mediumProfile,
        pubDate: item.querySelector("pubDate")?.textContent || "",
        content,
        thumbnail: imageFromHtml(content)
      };
    });
  }

  (async function loadPosts() {
    try {
      renderPosts(await fetchRss2Json());
    } catch (primaryError) {
      console.warn("Primary Medium feed service failed.", primaryError);
      try {
        renderPosts(await fetchAllOrigins());
      } catch (fallbackError) {
        console.error("Medium feed fallback failed.", fallbackError);
        renderError("The automatic feed is temporarily unavailable.");
      }
    }
  })();
})();

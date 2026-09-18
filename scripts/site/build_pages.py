"""Regenerate the site's HTML pages with a shared head, header and footer.

Run from anywhere:  python3 scripts/site/build_pages.py
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
P = str(HERE.parents[1])

FONTS = ("https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500"
         "&family=Inter:wght@400;500;600&family=Noto+Sans+Telugu:wght@400;500;600&family=Noto+Serif+Telugu:wght@500;600;700&display=swap")

FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='10' fill='%23a8431f'/%3E"
           "%3Cg fill='none' stroke='%23fffaf1' stroke-width='2' stroke-linejoin='round'%3E%3Cpath d='M20 7c4.5 4.3 4.5 8.7 0 13-4.5-4.3-4.5-8.7 0-13Zm0 26c-4.5-4.3-4.5-8.7 0-13 4.5 4.3 4.5 8.7 0 13ZM7 20c4.3-4.5 8.7-4.5 13 0-4.3 4.5-8.7 4.5-13 0Zm26 0c-4.3 4.5-8.7 4.5-13 0 4.3-4.5 8.7-4.5 13 0Z'/%3E%3C/g%3E%3C/svg%3E")

THEME_SCRIPT = ("<script>(function(){var t;try{t=localStorage.getItem('folkSite_theme')}catch(e){}"
                "if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}"
                "document.documentElement.setAttribute('data-theme',t)})();</script>")

BRAND_MARK = """<svg class="brand-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <circle cx="20" cy="20" r="18.5" stroke="currentColor" stroke-width="1.6"/>
            <path d="M20 7.5c4.2 4 4.2 8.2 0 12.3-4.2-4.1-4.2-8.3 0-12.3Zm0 25c-4.2-4-4.2-8.2 0-12.3 4.2 4.1 4.2 8.3 0 12.3ZM7.5 20c4-4.2 8.2-4.2 12.3 0-4.1 4.2-8.3 4.2-12.3 0Zm25 0c-4 4.2-8.2 4.2-12.3 0 4.1-4.2 8.3-4.2 12.3 0Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
            <circle cx="11.5" cy="11.5" r="1.5" fill="currentColor"/><circle cx="28.5" cy="11.5" r="1.5" fill="currentColor"/>
            <circle cx="11.5" cy="28.5" r="1.5" fill="currentColor"/><circle cx="28.5" cy="28.5" r="1.5" fill="currentColor"/>
          </svg>"""


def head(title, description, prefix):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="{description}" />
  <meta name="theme-color" content="#a8431f" />
  <title>{title}</title>
  <link rel="icon" href="{FAVICON}" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="{FONTS}" rel="stylesheet">
  <link rel="stylesheet" href="{prefix}assets/css/styles.css" />
  {THEME_SCRIPT}
</head>"""


def header(prefix, current):
    items = [
        ("home", f"{prefix}index.html", "Home"),
        ("andhra", f"{prefix}songs/andhra.html", "Andhra Songs"),
        ("telangana", f"{prefix}songs/telangana.html", "Telangana Songs"),
        ("instruments", f"{prefix}instruments/index.html", "Instruments"),
        ("artists", f"{prefix}artists/index.html", "Artists"),
        ("admin", f"{prefix}admin/login.html", "Admin"),
    ]
    current_attr = ' aria-current="page"'
    links = "\n".join(
        f'          <a href="{href}"{current_attr if key == current else ""}>{label}</a>' for key, href, label in items
    )
    return f"""<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container nav-wrap">
      <a class="brand" href="{prefix}index.html" aria-label="Telugu Folk Songs — home">
        {BRAND_MARK}
        <span class="brand-text">
          <span class="brand-name">Telugu Folk Songs</span>
          <span class="brand-te" lang="te">తెలుగు జానపద గీతాలు</span>
        </span>
      </a>
      <div class="nav-actions">
        <nav class="nav-links" id="site-nav" aria-label="Main">
{links}
        </nav>
        <button id="theme-toggle" class="btn-icon theme-toggle" type="button" aria-label="Switch between light and dark theme">
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z"/></svg>
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        </button>
        <button id="nav-toggle" class="btn-icon nav-toggle" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="Open menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        </button>
      </div>
    </div>
  </header>
"""


def footer(prefix):
    return f"""
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-about">
        <a class="brand" href="{prefix}index.html">
          {BRAND_MARK}
          <span class="brand-text">
            <span class="brand-name">Telugu Folk Songs</span>
            <span class="brand-te" lang="te">తెలుగు జానపద గీతాలు</span>
          </span>
        </a>
        <p>A digital archive of folk songs from Andhra Pradesh and Telangana: original Telugu lyrics, transliteration, line-by-line English translation and notes on every song.</p>
      </div>
      <nav class="footer-links" aria-label="Footer">
        <h4>Explore</h4>
        <ul>
          <li><a href="{prefix}songs/andhra.html">Andhra Pradesh Songs</a></li>
          <li><a href="{prefix}songs/telangana.html">Telangana Songs</a></li>
          <li><a href="{prefix}songs/index.html">All Songs</a></li>
          <li><a href="{prefix}instruments/index.html">Instruments</a></li>
          <li><a href="{prefix}artists/index.html">Artists</a></li>
        </ul>
      </nav>
      <div class="footer-project">
        <h4>The project</h4>
        <p class="project-title">Folk Music of Andhra Pradesh and Telangana: A Linguistic, Musical, and Cultural Study</p>
        <p>Prof. T. K. Saroja</p>
      </div>
    </div>
    <div class="container footer-bottom">
      <p>Recordings belong to their original artists and labels. Each song page links to its source.</p>
      <a href="{prefix}admin/login.html">Admin</a>
    </div>
  </footer>
"""


def scripts(prefix, names):
    tags = "\n".join(f'  <script src="{prefix}assets/js/{name}"></script>' for name in ["data.js", "common.js", *names])
    return f"{tags}\n</body>\n</html>\n"


def page(path, title, description, prefix, current, main, js):
    html = head(title, description, prefix) + "\n" + header(prefix, current) + "\n" + main.strip("\n") + "\n" + footer(prefix) + "\n" + scripts(prefix, js)
    target = Path(P) / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(html, encoding="utf-8")
    print("wrote", path)


# ---------------------------------------------------------------- song lists
FILTERS = """
      <section class="filters-panel" aria-label="Filter songs">
        <div class="filter-grid">
          <label>
            Search
            <input id="songs-search" type="search" placeholder="Title, lyrics, artist… (Telugu or English)" />
          </label>
          <label>
            Category
            <select id="filter-category"></select>
          </label>
          <label>
            Artist
            <select id="filter-artist"></select>
          </label>
          <label>
            Sort
            <select id="sort-by">
              <option value="latest">Collection order</option>
              <option value="alphabetical">A to Z</option>
            </select>
          </label>
        </div>
      </section>"""


def song_list_main(region, eyebrow, h1, te, lead, links, heading):
    region_attr = f' data-region="{region}"' if region else ""
    eyebrow_html = f'        <p class="eyebrow">{eyebrow}</p>' if eyebrow else ""
    lead_html = f'\n        <p class="page-hero__lead">{lead}</p>' if lead else ""
    return f"""
  <main id="main" class="page-content"{region_attr}>
    <section class="page-hero">
      <div class="dot-field" aria-hidden="true"></div>
      <div class="container">
{eyebrow_html}
        <h1>{h1}</h1>
        <p class="page-hero__te" lang="te">{te}</p>{lead_html}
        <p class="page-hero__links">{links}</p>
      </div>
    </section>

    <div class="container">
{FILTERS}

      <section class="results">
        <div class="section-head">
          <h2>{heading}</h2>
          <p id="songs-count" class="muted" aria-live="polite"></p>
        </div>
        <div id="songs-grid" class="song-grid"></div>
      </section>
    </div>
  </main>
"""


page(
    "songs/andhra.html",
    "Andhra Pradesh Folk Songs | Telugu Folk Songs",
    "Folk songs from Andhra Pradesh with Telugu lyrics, transliteration, English translation and notes on each song.",
    "../", "andhra",
    song_list_main(
        "Andhra", "", "Andhra Pradesh Folk Songs", "ఆంధ్రప్రదేశ్ జానపద గీతాలు",
        "",
        '<a class="text-link" href="telangana.html">Telangana songs →</a><a class="text-link" href="../artists/index.html?region=Andhra">Andhra Pradesh artists →</a>',
        "Songs",
    ),
    ["songs.js"],
)

page(
    "songs/telangana.html",
    "Telangana Folk Songs | Telugu Folk Songs",
    "Folk songs from Telangana with Telugu lyrics, transliteration, English translation and notes on each song.",
    "../", "telangana",
    song_list_main(
        "Telangana", "", "Telangana Folk Songs", "తెలంగాణ జానపద గీతాలు",
        "",
        '<a class="text-link" href="andhra.html">Andhra Pradesh songs →</a><a class="text-link" href="../artists/index.html?region=Telangana">Telangana artists →</a>',
        "Songs",
    ),
    ["songs.js"],
)

page(
    "songs/index.html",
    "All Songs | Telugu Folk Songs",
    "Browse every Telugu folk song in the collection, from Andhra Pradesh and Telangana.",
    "../", "",
    song_list_main(
        "", "The complete collection", "All Songs", "అన్ని జానపద గీతాలు",
        "Every song in the archive from both regions, with Telugu lyrics, transliteration, English translation and notes.",
        '<a class="text-link" href="andhra.html">Andhra Pradesh songs →</a><a class="text-link" href="telangana.html">Telangana songs →</a>',
        "Songs",
    ),
    ["songs.js"],
)

# ---------------------------------------------------------------- song detail
page(
    "songs/song.html",
    "Song | Telugu Folk Songs",
    "Listen to a Telugu folk song and read its lyrics in Telugu, transliteration and English translation, with notes on its meaning.",
    "../", "",
    """
  <main id="main" class="page-content">
    <div class="container" id="song-detail-root">
      <div class="song-hero">
        <div class="skeleton" style="height: 18px; width: 180px;"></div>
        <div class="skeleton" style="height: 56px; width: min(420px, 90%); margin-top: 28px;"></div>
        <div class="skeleton" style="height: 22px; width: 220px; margin-top: 14px;"></div>
      </div>
      <div class="song-layout">
        <div class="song-main"><div class="skeleton" style="height: 120px;"></div><div class="skeleton" style="height: 420px;"></div></div>
        <div class="song-aside"><div class="skeleton" style="height: 260px;"></div></div>
      </div>
    </div>
  </main>
""",
    ["song-detail.js"],
)

# ---------------------------------------------------------------- artists
page(
    "artists/index.html",
    "Artists | Telugu Folk Songs",
    "The singers and performers behind the Telugu folk songs in the collection, from Andhra Pradesh and Telangana.",
    "../", "artists",
    """
  <main id="main" class="page-content">
    <section class="page-hero">
      <div class="dot-field" aria-hidden="true"></div>
      <div class="container">
        <p class="eyebrow">Singers &amp; performers</p>
        <h1>Artists</h1>
        <p class="page-hero__te" lang="te">గాయకులు · కళాకారులు</p>
        <p class="page-hero__lead">The voices behind the collection. Each profile lists the songs an artist performs, and you can view artists from Andhra Pradesh, Telangana or both.</p>
      </div>
    </section>

    <div class="container">
      <div class="artists-toolbar">
        <div id="artist-region-toggle" class="segmented" role="group" aria-label="Show artists by region">
          <button type="button" data-region="All" aria-pressed="true">All Artists</button>
          <button type="button" data-region="Andhra" aria-pressed="false">Andhra Pradesh</button>
          <button type="button" data-region="Telangana" aria-pressed="false">Telangana</button>
        </div>
        <p id="artists-count" class="muted" aria-live="polite"></p>
      </div>
      <div id="artists-grid" class="artist-grid"></div>
    </div>
  </main>
""",
    ["artists.js"],
)

# ---------------------------------------------------------------- admin
page(
    "admin/login.html",
    "Admin Login | Telugu Folk Songs",
    "Admin login for the Telugu Folk Songs archive.",
    "../", "admin",
    """
  <main id="main" class="page-content admin-wrap">
    <section class="card admin-card">
      <p class="eyebrow">Admin</p>
      <h1 style="margin-top: 0.6rem;">Sign in</h1>
      <p class="muted" style="margin-top: 0.4rem;">Only project admins can add or edit songs.</p>
      <form id="admin-login-form" class="admin-form">
        <label>
          Email
          <input id="admin-email" type="email" placeholder="you@example.com" autocomplete="username" required />
        </label>
        <label>
          Password
          <input id="admin-password" type="password" placeholder="••••••••" autocomplete="current-password" required />
        </label>
        <button class="btn" type="submit">Sign in</button>
      </form>
      <p id="admin-login-message" class="muted" aria-live="polite"></p>
    </section>
  </main>
""",
    ["admin-login.js"],
)

admin_src = open(f"{P}/admin/index.html", encoding="utf-8").read()
main_inner = re.search(r"<main[^>]*>(.*)</main>", admin_src, re.S).group(1)
if 'class="container admin-sections"' in main_inner:
    # Already generated once: take just the cards inside the admin-sections wrapper.
    main_inner = re.search(r'<div class="container admin-sections">(.*)</div>\s*$', main_inner, re.S).group(1)
cards = main_inner[main_inner.index('<section class="card">'):].strip()
cards = "\n".join(line[2:] if line.startswith("  ") else line for line in cards.split("\n"))
cards = "\n".join("  " + line if line.strip() else line for line in cards.rstrip().split("\n"))
page(
    "admin/index.html",
    "Admin Dashboard | Telugu Folk Songs",
    "Admin dashboard for the Telugu Folk Songs archive.",
    "../", "admin",
    f"""
  <main id="main" class="page-content">
    <section class="page-hero">
      <div class="container admin-head">
        <div>
          <p class="eyebrow">Admin</p>
          <h1>Dashboard</h1>
          <p class="page-hero__lead">Add, edit and delete songs and categories. Every public page updates from this data.</p>
        </div>
        <div class="admin-head-actions">
          <button id="admin-logout-btn" class="btn-secondary" type="button">Log out</button>
        </div>
      </div>
    </section>

    <div class="container admin-sections">
      {cards}
    </div>
  </main>
""",
    ["admin.js"],
)

# ---------------------------------------------------------------- home
page(
    "index.html",
    "Telugu Folk Songs — Folk Music of Andhra Pradesh & Telangana",
    "A digital archive of folk songs from Andhra Pradesh and Telangana with Telugu lyrics, transliteration, English translation, and notes on language, music and culture.",
    "", "home",
    (HERE / "home.html").read_text(encoding="utf-8"),
    ["home.js"],
)


# ---------------------------------------------------------------- instruments
import html as _html

INSTRUMENTS_FILE = HERE / "instruments.json"
CATEGORIES = [
    ("drum", "Drums", "అవనద్ధ వాద్యాలు"),
    ("wind", "Wind instruments", "సుషిర వాద్యాలు"),
    ("string", "String instruments", "తంత్రీ వాద్యాలు"),
    ("idiophone", "Bells, cymbals & clappers", "ఘన వాద్యాలు"),
]
CATEGORY_TITLE = {key: title for key, title, _ in CATEGORIES}
CATEGORY_SINGULAR = {"drum": "Drum", "wind": "Wind instrument", "string": "String instrument", "idiophone": "Bells, cymbals & clappers"}
REGION_LABEL = {"Andhra": "Andhra Pradesh", "Telangana": "Telangana"}
SECTION_TITLES = [
    ("about", "About"),
    ("construction", "How it is made"),
    ("playing", "How it is played"),
    ("cultural", "Beliefs & practices"),
    ("usage", "Where you will hear it"),
]


def esc(value):
    return _html.escape(str(value or ""), quote=True)


def cited(text):
    """Escape a paragraph and turn [1][3] markers into links to the sources list."""
    def repl(match):
        numbers = re.findall(r"\d+", match.group(0))
        links = ",".join('<a href="#src-{0}">{0}</a>'.format(n) for n in numbers)
        return "<sup>" + links + "</sup>"
    return re.sub(r"\s*((?:\[\d+\])+)", repl, esc(text))


def ext_link(url, text):
    return '<a href="{}" target="_blank" rel="noopener noreferrer">{}</a>'.format(esc(url), text)


def region_tags(regions):
    return "".join('<span class="region-tag" data-region="{}">{}</span>'.format(esc(r), esc(REGION_LABEL.get(r, r))) for r in regions)


def media_tile(inst):
    images = inst.get("images") or []
    if images:
        return '<img src="{}" alt="{}" loading="lazy" width="400" height="300" />'.format(esc(images[0]["imageUrl"]), esc(images[0]["shows"]))
    return '<div class="media-placeholder" aria-hidden="true"><span lang="te">{}</span></div>'.format(esc(inst["nameTe"]))


def youtube_id(url):
    match = re.search(r"(?:youtube\.com/watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})", url)
    return match.group(1) if match else None


def media_credit(label, source_url, author, license_=None, note=None):
    """A short credit line for a photo, video or audio clip, plus any note on how confidently it matches
    this instrument (e.g. a name or shape that doesn't quite line up with the written sources).

    With no source_url — a photo from the project's own collection — it is just the caption: better to
    say nothing about authorship than to imply a credit or licence that hasn't been established."""
    if not source_url:
        credit = '<p class="media-credit">{}</p>'.format(esc(label))
    else:
        by = ' by <a href="{}" target="_blank" rel="noopener noreferrer">{}</a>'.format(esc(source_url), esc(author)) if author else ""
        licence = ", {}".format(esc(license_)) if license_ else ""
        credit = '<p class="media-credit">{}{}{} — <a href="{}" target="_blank" rel="noopener noreferrer">source</a></p>'.format(
            esc(label), by, licence, esc(source_url))
    if note:
        credit += '<p class="media-note"><strong>Note:</strong> {}</p>'.format(esc(note))
    return credit


def hero_media_html(inst):
    images, videos, audio = inst.get("images") or [], inst.get("videos") or [], inst.get("audio") or []
    if not images and not videos and not audio:
        return ""
    parts = ['<section class="card inst-media-card">']
    for image in images:
        parts.append('<img class="inst-hero__img" src="{}" alt="{}" loading="lazy" />'.format(esc(image["imageUrl"]), esc(image["shows"])))
        parts.append(media_credit("Photo: " + image["shows"], image.get("filePage"), image.get("author"),
                                  image.get("license"), image.get("note")))
    for video in videos:
        vid = youtube_id(video["url"])
        if vid:
            parts.append(
                '<div class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/{}" title="{}" '
                'loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>'.format(
                    esc(vid), esc(video["title"])))
        else:
            parts.append('<div class="video-embed"><video controls preload="none" src="{}"></video></div>'.format(esc(video["url"])))
        parts.append(media_credit("Video: " + video["what"], video.get("filePage") or video["url"], video["channel"], video.get("license"), video.get("note")))
    for clip in audio:
        parts.append('<audio controls preload="none" src="{}" style="width: 100%;"></audio>'.format(esc(clip["url"])))
        parts.append(media_credit("Audio", clip["filePage"], clip["author"], clip["license"], clip.get("note")))
    parts.append("</section>")
    return "\n          ".join(parts)


def instrument_card(inst, prefix):
    return """          <a class="inst-card" href="{id}.html" data-category="{cat}">
            <div class="inst-card__media">{media}</div>
            <span class="type-tag">{type}</span>
            <div class="inst-card__body">
              <h3 class="inst-card__en">{en}</h3>
              <p class="inst-card__summary">{summary}</p>
              <div class="inst-card__foot">{regions}</div>
            </div>
          </a>""".format(
        id=esc(inst["id"]), cat=esc(inst["category"]), media=media_tile(inst),
        type=esc(CATEGORY_SINGULAR[inst["category"]]), en=esc(inst["nameEn"]),
        summary=esc(inst["summary"]), regions=region_tags(inst.get("regions", [])),
    )


def source_item(number, source):
    publisher = " — " + esc(source["publisher"]) if source.get("publisher") else ""
    return '<li id="src-{}">{}{}</li>'.format(number, ext_link(source.get("url"), esc(source.get("title"))), publisher)


def instrument_detail(inst, instruments, prefix):
    sections = inst.get("sections", {})
    toc, body = [], []
    for key, title in SECTION_TITLES:
        paragraphs = [p for p in sections.get(key, []) if str(p).strip()]
        if not paragraphs:
            continue
        extra = ""
        if key == "usage" and inst.get("traditions"):
            extra = '<div class="tradition-list" style="margin-top: 1rem;">' + "".join("<span>{}</span>".format(esc(t)) for t in inst["traditions"]) + "</div>"
        toc.append('<a href="#{}">{}</a>'.format(key, esc(title)))
        body.append('        <section class="card inst-section" id="{}">\n          <h2>{}</h2>\n          {}{}\n        </section>'.format(
            key, esc(title), "".join("<p>{}</p>".format(cited(p)) for p in paragraphs), extra))

    toc.append('<a href="#sources">Sources</a>')
    notes = ""
    if inst.get("uncertain"):
        notes = '<details class="research-notes"><summary>Research notes: points where sources differ or could not be confirmed</summary><ul>{}</ul></details>'.format(
            "".join("<li>{}</li>".format(esc(n)) for n in inst["uncertain"]))
    body.append('        <section class="card inst-section sources" id="sources">\n          <h2>Sources</h2>\n          <ol>{}</ol>\n          <p class="research-note">This page was compiled from the sources above. The numbers in the text point to the source for each statement.</p>\n          {}\n        </section>'.format(
        "".join(source_item(n, s) for n, s in enumerate(inst.get("sources", []), start=1)), notes))

    facts = list(inst.get("facts", []))
    if inst.get("communities") and not any(f.get("label", "").lower().startswith("communit") for f in facts):
        facts.append({"label": "Communities", "value": ", ".join(inst["communities"])})
    facts_html = "".join("<div><strong>{}</strong><span>{}</span></div>".format(esc(f["label"]), esc(f["value"])) for f in facts)
    other_names = []
    for other in inst.get("otherNames", []):
        name = esc(other.get("en", ""))
        if other.get("te"):
            name += ' (<span lang="te">{}</span>)'.format(esc(other["te"]))
        other_names.append(name)

    related = [i for i in instruments if i["category"] == inst["category"] and i["id"] != inst["id"]][:5]
    related_html = "".join(
        '<a href="{}.html"><span><span class="te" lang="te">{}</span> <small>{}</small></span><span aria-hidden="true">→</span></a>'.format(esc(r["id"]), esc(r["nameTe"]), esc(r["nameEn"]))
        for r in related
    )
    aside = []
    if facts_html:
        aside.append('<section class="card"><h2 class="card-title">Quick facts</h2><div class="details-list">{}</div></section>'.format(facts_html))
    if related_html:
        aside.append('<section class="card"><h2 class="card-title">More {}</h2><div class="related-inst">{}</div></section>'.format(esc(CATEGORY_TITLE[inst["category"]].lower()), related_html))
    aside.append('<section class="card"><h2 class="card-title">Explore</h2><div class="related-inst"><a href="index.html"><span>All instruments</span><span aria-hidden="true">→</span></a><a href="../songs/andhra.html"><span>Andhra Pradesh songs</span><span aria-hidden="true">→</span></a><a href="../songs/telangana.html"><span>Telangana songs</span><span aria-hidden="true">→</span></a></div></section>')

    aka = '<p class="inst-aka">Also known as {}</p>'.format(", ".join(other_names)) if other_names else ""
    return """
  <main id="main" class="page-content" data-category="{cat}">
    <div class="container">
      <header class="inst-hero">
        <a class="breadcrumb" href="index.html">← All instruments</a>
        <div class="inst-hero__body">
          <div class="song-hero__tags"><span class="type-tag">{type}</span>{regions}</div>
          <h1 class="inst-title-te" lang="te">{te}</h1>
          <p class="inst-title-en">{en}</p>
          {aka}
          <p class="inst-summary">{summary}</p>
          <nav class="inst-toc" aria-label="On this page">{toc}</nav>
        </div>
      </header>

      <div class="inst-layout">
        <article class="inst-main">
          {media}
{body}
        </article>
        <aside class="inst-aside">
          {aside}
        </aside>
      </div>
    </div>
  </main>
""".format(
        cat=esc(inst["category"]), type=esc(CATEGORY_SINGULAR[inst["category"]]), regions=region_tags(inst.get("regions", [])),
        te=esc(inst["nameTe"]), en=esc(inst["nameEn"]), aka=aka, summary=esc(inst["summary"]), toc="".join(toc),
        media=hero_media_html(inst), body="\n".join(body), aside="\n          ".join(aside),
    )


def build_instruments():
    if not INSTRUMENTS_FILE.exists():
        return
    instruments = json.loads(INSTRUMENTS_FILE.read_text(encoding="utf-8"))
    order = [c[0] for c in CATEGORIES]
    instruments.sort(key=lambda i: (order.index(i["category"]), i["nameEn"].lower()))
    prefix = "../"

    groups, buttons = [], []
    for key, title, title_te in CATEGORIES:
        members = [i for i in instruments if i["category"] == key]
        if not members:
            continue
        buttons.append('          <button type="button" data-filter="{}" aria-pressed="false">{}</button>'.format(key, esc(title)))
        groups.append('          <h2 class="inst-group-title" data-group="{}">{} <small lang="te">{}</small></h2>\n{}'.format(
            key, esc(title), esc(title_te), "\n".join(instrument_card(i, prefix) for i in members)))

    page(
        "instruments/index.html",
        "Instruments of Telugu Folk Music | Telugu Folk Songs",
        "The drums, strings, wind instruments, bells and clappers of Telugu folk music: how each is made, the beliefs around it and the traditions it accompanies.",
        prefix, "instruments",
        """
  <main id="main" class="page-content">
    <section class="page-hero">
      <div class="dot-field" aria-hidden="true"></div>
      <div class="container">
        <p class="eyebrow">Vadyalu</p>
        <h1>Instruments of Telugu Folk Music</h1>
        <p class="page-hero__te" lang="te">తెలుగు జానపద వాద్యాలు</p>
        <p class="page-hero__lead">The drums, strings, wind instruments, bells and clappers heard in the folk songs of Andhra Pradesh and Telangana. Each page describes how the instrument is made and played, the beliefs and practices around it, and the traditions it accompanies.</p>
      </div>
    </section>

    <div class="container">
      <div class="inst-toolbar">
        <div id="instrument-filter" class="segmented" role="group" aria-label="Filter instruments by type">
          <button type="button" data-filter="all" aria-pressed="true">All</button>
{buttons}
        </div>
        <p id="instrument-count" class="muted" aria-live="polite">{count} instruments</p>
      </div>
      <div class="inst-grid" id="instrument-grid">
{groups}
      </div>
    </div>
  </main>
""".format(buttons="\n".join(buttons), count=len(instruments), groups="\n".join(groups)),
        ["instruments.js"],
    )

    for inst in instruments:
        page(
            "instruments/{}.html".format(inst["id"]),
            "{} ({}) | Instruments | Telugu Folk Songs".format(inst["nameEn"], inst["nameTe"]),
            esc(inst["summary"]),
            prefix, "instruments",
            instrument_detail(inst, instruments, prefix),
            ["instruments.js"],
        )


build_instruments()

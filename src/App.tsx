import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "./Icon";
import {
  posts,
  postUrl,
  selectPosts,
  SNAPSHOT_LABEL,
  topics,
  type FeedView,
  type Period,
  type Post,
  type Topic,
} from "./data";

const STORAGE_KEY = "swarmfeed.saved.v1";
const external = { target: "_blank", rel: "noopener noreferrer" } as const;
const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(date));
const countLabel = (n: number) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
const topicIcons: Record<Exclude<Topic, "All posts">, IconName> = {
  Building: "code",
  Community: "people",
  "AI agents": "chip",
};

function readSaved(): { ids: string[]; warning: string } {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]",
    );
    if (!Array.isArray(value))
      return {
        ids: [],
        warning: "Saved posts could not be read. You can save them again.",
      };
    return {
      ids: [
        ...new Set(
          value.filter(
            (id): id is string =>
              typeof id === "string" && posts.some((post) => post.id === id),
          ),
        ),
      ],
      warning: "",
    };
  } catch {
    return {
      ids: [],
      warning:
        "Browser storage is unavailable. Saved posts will last for this visit.",
    };
  }
}

function Avatar({ post }: { post: Post }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={`avatar avatar-${post.avatar}`} aria-hidden="true">
      {failed ? (
        post.name.slice(0, 1)
      ) : (
        <img
          src={`./assets/${post.avatar}.webp`}
          alt=""
          width="42"
          height="42"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

function PostCard({
  post,
  saved,
  onSave,
  onCopy,
  onSource,
  rank,
}: {
  post: Post;
  saved: boolean;
  onSave: () => void;
  onCopy: () => void;
  onSource: () => void;
  rank: number;
}) {
  return (
    <article
      className="post-card"
      aria-label={`Tweet by ${post.name}`}
      data-post-id={post.id}
    >
      <div className="post-topline">
        <span className="post-topic">
          <Icon name={topicIcons[post.topic]} size={15} />
          {post.topic}
        </span>
        <span className="rank">{String(rank).padStart(2, "0")}</span>
      </div>
      <header className="post-author">
        <a
          className="author-link"
          href={`https://x.com/${post.handle}`}
          {...external}
          aria-label={`${post.name} on X (opens in a new tab)`}
        >
          <Avatar post={post} />
          <span className="author-details">
            <span className="author-name">{post.name}</span>
            <span className="handle">@{post.handle}</span>
          </span>
        </a>
        <a
          className="x-link"
          href={postUrl(post)}
          {...external}
          aria-label={`Open ${post.name}'s tweet on X (opens in a new tab)`}
        >
          <Icon name="x" size={17} />
        </a>
      </header>
      <blockquote cite={postUrl(post)}>
        <p>
          {post.text}
          {post.excerpt && "…"}
        </p>
      </blockquote>
      <div className="post-dateline">
        <time dateTime={post.date} title={new Date(post.date).toUTCString()}>
          {dateLabel(post.date)} 2026
        </time>
        <span aria-hidden="true">·</span>
        <a href={postUrl(post)} {...external}>
          {post.excerpt ? "Read full tweet" : "View tweet"}
          <Icon name="arrowUp" size={13} />
        </a>
      </div>
      <div className="post-bottom">
        <div className="metrics" role="group" aria-label="Recorded engagement">
          <span title={`${post.likes} likes in snapshot`}>
            <Icon name="heart" size={17} />
            <span aria-hidden="true">{countLabel(post.likes)}</span>
            <span className="sr-only">{post.likes} recorded likes</span>
          </span>
          <span title={`${post.reposts} reposts in snapshot`}>
            <Icon name="repeat" size={17} />
            <span aria-hidden="true">{countLabel(post.reposts)}</span>
            <span className="sr-only">{post.reposts} recorded reposts</span>
          </span>
          <span title={`${post.replies} replies in snapshot`}>
            <Icon name="reply" size={16} />
            <span aria-hidden="true">{countLabel(post.replies)}</span>
            <span className="sr-only">{post.replies} recorded replies</span>
          </span>
        </div>
        <div className="post-actions">
          <button
            type="button"
            className="icon-button"
            onClick={onCopy}
            aria-label={`Copy link to ${post.name}'s tweet`}
            title="Copy tweet link"
          >
            <Icon name="link" size={18} />
          </button>
          <button
            type="button"
            className={`icon-button ${saved ? "is-saved" : ""}`}
            onClick={onSave}
            aria-label={`${saved ? "Unsave" : "Save"} ${post.name}'s tweet`}
            aria-pressed={saved}
            title={saved ? "Remove from saved" : "Save tweet"}
          >
            <Icon name="bookmark" size={18} />
          </button>
        </div>
      </div>
      <button className="source-link" type="button" onClick={onSource}>
        Snapshot details
        <Icon name="info" size={13} />
      </button>
    </article>
  );
}

type Modal =
  | { type: "about" }
  | { type: "source"; post: Post }
  | { type: "copy"; post: Post }
  | null;

export function App() {
  const [initialSaved] = useState(readSaved);
  const [saved, setSaved] = useState(initialSaved.ids);
  const [view, setView] = useState<FeedView>("top");
  const [topic, setTopic] = useState<Topic>("All posts");
  const [period, setPeriod] = useState<Period>("all");
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState(initialSaved.warning);
  const [modal, setModal] = useState<Modal>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const copyRef = useRef<HTMLInputElement>(null);
  const visiblePosts = selectPosts(query, topic, view, period, saved);
  const hasFilters = query !== "" || topic !== "All posts" || period !== "all";

  useEffect(() => {
    if (modal) {
      dialogRef.current?.showModal();
      if (modal.type === "copy") copyRef.current?.select();
    } else dialogRef.current?.close();
    const previousOverflow = document.body.style.overflow;
    if (modal) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modal]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null)
        setSaved(readSaved().ids);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function resetFilters() {
    setQuery("");
    setTopic("All posts");
    setPeriod("all");
    setFeedback("");
  }
  function changeView(next: FeedView) {
    setView(next);
    setFeedback("");
  }
  function showFeed(next: FeedView = "top") {
    changeView(next);
    resetFilters();
    document.getElementById("feed")?.scrollIntoView();
    searchRef.current?.focus({ preventScroll: true });
  }
  function toggleSave(post: Post) {
    const removing = saved.includes(post.id);
    const next = removing
      ? saved.filter((id) => id !== post.id)
      : [...saved, post.id];
    setSaved(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setFeedback(
        removing ? "Tweet removed from saved." : "Tweet saved on this device.",
      );
    } catch {
      setFeedback(
        removing
          ? "Tweet removed for this visit. Browser storage is unavailable."
          : "Tweet saved for this visit. Browser storage is unavailable.",
      );
    }
  }
  async function copyPost(post: Post) {
    try {
      await navigator.clipboard.writeText(postUrl(post));
      setFeedback("Tweet link copied. Ready to share.");
    } catch {
      setModal({ type: "copy", post });
    }
  }
  const heading = view === "saved" ? "Saved tweets" : "Inside the swarm";

  return (
    <>
      <a className="skip-link" href="#feed">
        Skip to tweets
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a
            className="brand"
            href="#"
            aria-label="Swarmfeed home"
            onClick={() => {
              changeView("top");
              resetFilters();
            }}
          >
            <img src="./favicon.svg" alt="" width="34" height="34" />
            <span>
              swarmfeed<span className="brand-dot">.</span>
            </span>
          </a>
          <nav className="header-nav" aria-label="Main navigation">
            <button
              type="button"
              className={view !== "saved" ? "nav-link active" : "nav-link"}
              onClick={() => showFeed("top")}
              aria-current={view !== "saved" ? "page" : undefined}
            >
              The feed
            </button>
            <button
              type="button"
              className={view === "saved" ? "nav-link active" : "nav-link"}
              onClick={() => showFeed("saved")}
              aria-current={view === "saved" ? "page" : undefined}
            >
              <Icon name="bookmark" size={16} />
              Saved
              {saved.length > 0 && (
                <span className="saved-count">{saved.length}</span>
              )}
            </button>
          </nav>
          <a className="header-external" href="https://imd.fun" {...external}>
            Explore IdentityMD
            <Icon name="arrowUp" size={16} />
          </a>
          <button
            className="mobile-about icon-button"
            type="button"
            aria-label="About Swarmfeed"
            onClick={() => setModal({ type: "about" })}
          >
            <Icon name="info" />
          </button>
        </div>
      </header>

      <main className="page-shell">
        <section className="hero" aria-labelledby="hero-title">
          <img
            className="hero-art"
            src="./assets/pepe-squad.webp"
            width="1536"
            height="1024"
            alt="Three Pepes equipped with an AI chip blaster, a laptop and a drone in a green swamp"
            fetchPriority="high"
          />
          <div className="hero-copy">
            <h1 id="hero-title">
              Big brains.
              <br />
              <span>Bigger signals.</span>
            </h1>
            <p>Top tweets about IdentityMD.</p>
            <button
              type="button"
              className="button-primary"
              onClick={() => showFeed()}
            >
              Explore tweets
              <Icon name="arrow" size={18} />
            </button>
          </div>
          <div className="hero-caption" aria-hidden="true">
            <Icon name="chip" size={15} />
            <span>Pepes. Armed with AI.</span>
          </div>
        </section>

        <div className="feed-layout">
          <section
            id="feed"
            className="feed"
            aria-labelledby="feed-heading"
            tabIndex={-1}
          >
            <div className="section-heading">
              <h2 id="feed-heading">{heading}</h2>
              <button
                type="button"
                className="snapshot-badge"
                onClick={() => setModal({ type: "about" })}
              >
                <span className="status-dot" />
                {SNAPSHOT_LABEL}
                <Icon name="info" size={14} />
              </button>
            </div>
            <div className="feed-toolbar">
              <div
                className="view-controls"
                role="group"
                aria-label="Feed order"
              >
                {(
                  [
                    { id: "top", label: "Top tweets", icon: "flame" },
                    { id: "latest", label: "Latest", icon: "clock" },
                    { id: "saved", label: "Saved", icon: "bookmark" },
                  ] as const
                ).map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    aria-pressed={view === item.id}
                    className={`view-button ${view === item.id ? "selected" : ""}`}
                    onClick={() => changeView(item.id)}
                  >
                    <Icon name={item.icon} size={17} />
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="search-control">
                <label htmlFor="tweet-search">
                  <Icon name="search" size={17} />
                  <span className="sr-only">Search tweets</span>
                </label>
                <input
                  ref={searchRef}
                  id="tweet-search"
                  name="search"
                  type="search"
                  placeholder="Search tweets…"
                  value={query}
                  autoComplete="off"
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setFeedback("");
                  }}
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    className="clear-search"
                    onClick={() => {
                      setQuery("");
                      searchRef.current?.focus();
                    }}
                  >
                    <Icon name="close" size={16} />
                  </button>
                )}
              </div>
            </div>
            <div className="filter-row">
              <div
                className="topic-controls"
                role="group"
                aria-label="Filter by topic"
              >
                {topics.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={`topic-button ${topic === item ? "selected" : ""}`}
                    aria-pressed={topic === item}
                    onClick={() => {
                      setTopic(item);
                      setFeedback("");
                    }}
                  >
                    {item === "All posts" ? "All" : item}
                  </button>
                ))}
              </div>
              <label className="period-control">
                <span className="sr-only">Post date range</span>
                <select
                  aria-label="Post date range"
                  value={period}
                  onChange={(event) => {
                    setPeriod(event.target.value as Period);
                    setFeedback("");
                  }}
                >
                  <option value="all">All dates</option>
                  <option value="week">7 days</option>
                </select>
              </label>
            </div>
            <div className="feed-status">
              <span role="status" aria-live="polite" aria-atomic="true">
                {feedback ||
                  `${visiblePosts.length} ${visiblePosts.length === 1 ? "tweet" : "tweets"} · ${view === "latest" ? "Newest in this snapshot" : view === "saved" ? "Saved on this device" : "Ranked by recorded likes"}`}
              </span>
              {hasFilters && (
                <button type="button" onClick={resetFilters}>
                  Reset filters
                </button>
              )}
            </div>
            {visiblePosts.length > 0 ? (
              <div className="post-grid">
                {visiblePosts.map((post, index) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    rank={index + 1}
                    saved={saved.includes(post.id)}
                    onSave={() => toggleSave(post)}
                    onCopy={() => void copyPost(post)}
                    onSource={() => setModal({ type: "source", post })}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">
                  <Icon
                    name={
                      view === "saved" && !hasFilters ? "bookmark" : "search"
                    }
                    size={28}
                  />
                </span>
                <h3>
                  {view === "saved" && !hasFilters
                    ? "Keep the good signals."
                    : "No tweets found."}
                </h3>
                <p>
                  {view === "saved" && !hasFilters
                    ? "Save a tweet with its bookmark button. It will be here when you come back on this device."
                    : query
                      ? `No matches for “${query}” with these filters. Try a different search or clear the filters.`
                      : "No tweets match these filters. Clear them to see more of the swarm."}
                </p>
                <button
                  className="button-secondary"
                  type="button"
                  onClick={() => {
                    resetFilters();
                    if (view === "saved" && !hasFilters) changeView("top");
                  }}
                >
                  {view === "saved" && !hasFilters
                    ? "Explore tweets"
                    : "Clear filters"}
                  <Icon name="arrow" size={17} />
                </button>
              </div>
            )}
            {visiblePosts.length > 0 && (
              <div className="feed-end">
                <Icon name="check" size={16} />
                <span>All caught up with this snapshot.</span>
                <a
                  href="https://x.com/search?q=%22IdentityMD%22%20OR%20%22identity.md%22&f=top"
                  {...external}
                >
                  Keep exploring on X<Icon name="arrowUp" size={14} />
                </a>
              </div>
            )}
          </section>

          <aside
            className="sidebar"
            aria-label="About the IdentityMD conversation"
          >
            <section className="radar-panel">
              <div className="aside-heading">
                <Icon name="radar" size={20} />
                <h2>On the radar</h2>
              </div>
              <p className="muted">Find your corner of the swarm.</p>
              <div className="radar-topics">
                {topics
                  .filter((item) => item !== "All posts")
                  .map((item) => (
                    <button
                      type="button"
                      key={item}
                      className={
                        topic === item ? "radar-topic selected" : "radar-topic"
                      }
                      onClick={() => {
                        setTopic(item);
                        setQuery("");
                        setPeriod("all");
                        changeView("top");
                        document.getElementById("feed")?.scrollIntoView();
                      }}
                    >
                      <span className="radar-topic-icon">
                        <Icon name={topicIcons[item]} size={19} />
                      </span>
                      <span>
                        <strong>{item}</strong>
                        <span>
                          {posts.filter((post) => post.topic === item).length}{" "}
                          tweets
                        </span>
                      </span>
                      <Icon name="arrowUp" size={16} />
                    </button>
                  ))}
              </div>
            </section>
            <section className="field-notes">
              <div className="aside-heading">
                <Icon name="info" size={19} />
                <h2>A little context</h2>
              </div>
              <p>
                A snapshot, not a live feed. Real posts, recorded likes, and a
                direct line to the original conversation.
              </p>
              <button
                type="button"
                className="text-button"
                onClick={() => setModal({ type: "about" })}
              >
                How this feed works
                <Icon name="arrow" size={16} />
              </button>
            </section>
            <section className="join-panel">
              <span className="join-symbol" aria-hidden="true">
                <Icon name="x" size={25} />
              </span>
              <h2>The swarm has a lot to say.</h2>
              <p>Meet the builders behind the signals.</p>
              <a
                className="button-secondary"
                href="https://x.com/search?q=%22IdentityMD%22%20OR%20%22identity.md%22&f=live"
                {...external}
              >
                Join the conversation
                <Icon name="arrowUp" size={17} />
              </a>
            </section>
            <p className="sidebar-footnote">
              Independent community reader.
              <br />
              Made for curious minds.
            </p>
          </aside>
        </div>
      </main>

      <footer className="site-footer">
        <a className="footer-brand" href="#">
          swarmfeed.
        </a>
        <span>A little less noise. A little more swarm.</span>
        <button type="button" onClick={() => setModal({ type: "about" })}>
          About & sources
          <Icon name="arrowUp" size={14} />
        </button>
      </footer>

      <dialog
        ref={dialogRef}
        className="dialog"
        aria-labelledby="dialog-title"
        onCancel={() => setModal(null)}
        onClose={() => setModal(null)}
        onKeyDown={(event) => {
          if (
            event.key !== "Tab" ||
            event.ctrlKey ||
            event.altKey ||
            event.metaKey
          )
            return;
          const controls = [
            ...event.currentTarget.querySelectorAll<HTMLElement>(
              'button, a[href], input, select, textarea, [tabindex="0"]',
            ),
          ].filter(
            (element) =>
              element.getClientRects().length > 0 &&
              !element.hasAttribute("disabled"),
          );
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom
            )
              setModal(null);
          }
        }}
      >
        <div className="dialog-heading">
          <h2 id="dialog-title">
            {modal?.type === "source"
              ? "Behind this tweet"
              : modal?.type === "copy"
                ? "Copy the tweet link"
                : "Find the signal."}
          </h2>
          <button
            type="button"
            className="icon-button"
            onClick={() => setModal(null)}
            aria-label="Close dialog"
            autoFocus
          >
            <Icon name="close" />
          </button>
        </div>
        {modal?.type === "about" && (
          <div className="dialog-body">
            <p>
              Swarmfeed is an independent reader for the IdentityMD
              conversation. This edition contains{" "}
              <strong>{posts.length} public posts</strong>, collected on{" "}
              <strong>{SNAPSHOT_LABEL}</strong>.
            </p>
            <h3>What does “top” mean?</h3>
            <p>
              Posts are ordered by the likes recorded on their public mirror
              pages. This is a selection of accessible posts, not a complete
              ranking of X. Counts may lag and do not update automatically.
            </p>
            <h3>Go straight to the source</h3>
            <p>
              Cards show the author’s words. An ellipsis marks an excerpt; “Read
              full tweet” opens the original on X. Snapshot details link to the
              public mirror used for each entry.
            </p>
            <h3>Your own little archive</h3>
            <p>
              Bookmarks stay in this browser’s local storage. They are not
              shared between devices. Likes and reposts are read-only figures,
              not buttons.
            </p>
            <p className="dialog-note">
              “7 days” means 28 October through 3 November 2026. External links
              open a new tab and may require an X account. Swarmfeed is not
              affiliated with X or an official IdentityMD account.
            </p>
            <a
              className="button-secondary"
              href="https://imd.fun"
              {...external}
            >
              Explore IdentityMD
              <Icon name="arrowUp" size={17} />
            </a>
          </div>
        )}
        {modal?.type === "source" && (
          <div className="dialog-body">
            <div className="source-author">
              <Avatar post={modal.post} />
              <div>
                <strong>{modal.post.name}</strong>
                <p>@{modal.post.handle}</p>
              </div>
            </div>
            <p>
              Published {dateLabel(modal.post.date)} 2026. Source accessed{" "}
              {SNAPSHOT_LABEL}. The mirror may show an earlier cached count.
            </p>
            <dl className="source-metrics">
              <div>
                <dt>Likes</dt>
                <dd>{modal.post.likes.toLocaleString("en")}</dd>
              </div>
              <div>
                <dt>Reposts</dt>
                <dd>{modal.post.reposts.toLocaleString("en")}</dd>
              </div>
              <div>
                <dt>Replies</dt>
                <dd>{modal.post.replies.toLocaleString("en")}</dd>
              </div>
              <div>
                <dt>Views</dt>
                <dd>{modal.post.views.toLocaleString("en")}</dd>
              </div>
            </dl>
            <p>
              {modal.post.excerpt
                ? "This card quotes a short excerpt. The original contains more text or media."
                : "The card contains the post’s main text; quoted posts and media are not reproduced."}{" "}
              Statements belong to their authors.
            </p>
            <div className="dialog-actions">
              <a
                className="button-primary"
                href={postUrl(modal.post)}
                {...external}
              >
                Read on X<Icon name="arrowUp" size={16} />
              </a>
              <a
                className="button-secondary"
                href={modal.post.source}
                {...external}
              >
                View source mirror
                <Icon name="arrowUp" size={16} />
              </a>
            </div>
          </div>
        )}
        {modal?.type === "copy" && (
          <div className="dialog-body">
            <p>
              Automatic copying isn’t available in this browser. Select and copy
              the link below.
            </p>
            <label htmlFor="copy-url">Tweet link</label>
            <input
              id="copy-url"
              ref={copyRef}
              className="copy-input"
              readOnly
              value={postUrl(modal.post)}
              onFocus={(event) => event.target.select()}
            />
            <a className="text-button" href={postUrl(modal.post)} {...external}>
              Open tweet on X<Icon name="arrowUp" size={16} />
            </a>
          </div>
        )}
      </dialog>
    </>
  );
}

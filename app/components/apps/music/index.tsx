"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { FastAverageColor } from "fast-average-color";
import { AppContent } from "../AppContent";
import { type AppDefinition } from "../types";
import { etherealTheme } from "../themes";
import { fetchListeningHistory, fetchLyrics, fetchPlaylists, fetchSongs } from "@/lib/music/storage";
import { type ListeningHistoryTrack, type Lyric, type Playlist, type Song } from "@/lib/music/types";

type MusicTab = "songs" | "history" | "playlists" | "lyrics";
type HistorySort = "playCount" | "lastPlayed" | "title" | "artist";

const fac = new FastAverageColor();
const historyDateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

const tabs: { id: MusicTab; label: string; icon: string }[] = [
  { id: "songs", label: "Gems", icon: "♫" },
  { id: "history", label: "History", icon: "↻" },
  { id: "playlists", label: "Playlists", icon: "◎" },
  { id: "lyrics", label: "Lyrics", icon: "✦" },
];

const moodAccents = ["var(--app-sage)", "var(--app-slate)", "var(--app-peach)", "var(--app-pink)"];
const moodBgs = [
  "var(--app-sage-soft)",
  "var(--app-slate-soft)",
  "var(--app-peach-soft)",
  "var(--app-pink-soft)",
];

const lyricBgs = [
  "var(--app-card-alt)",
  "var(--app-sage-soft)",
  "var(--app-slate-soft)",
  "var(--app-peach-soft)",
  "var(--app-pink-soft)",
];

function songCover(song: Song): string {
  return `https://img.youtube.com/vi/${song.playConfig.id}/mqdefault.jpg`;
}

function songYTMusicUrl(song: Song): string {
  return `https://music.youtube.com/watch?v=${song.playConfig.id}`;
}

function trackNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

function useAccentColor(src: string): string | null {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      if (cancelled) return;
      try {
        const result = fac.getColor(img);
        setColor(result.hex);
      } catch {
        /* cross-origin fallback */
      }
    };
    return () => {
      cancelled = true;
    };
  }, [src]);

  return color;
}

function SpotifyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.5 17.3c-.2.3-.6.4-.9.2-2.5-1.5-5.7-1.9-9.4-1-.4.1-.7-.1-.8-.5-.1-.4.1-.7.5-.8 4.1-.9 7.6-.5 10.4 1.2.3.2.4.6.2.9zm1.5-3.3c-.3.4-.8.5-1.2.3-2.9-1.8-7.2-2.3-10.6-1.3-.4.1-.9-.1-1-.6-.1-.4.1-.9.6-1 3.9-1.2 8.7-.6 12 1.5.3.2.4.7.2 1.1zm.1-3.4c-3.4-2-9.1-2.2-12.4-1.2-.5.2-1-.2-1.2-.7-.2-.5.2-1 .7-1.2 3.8-1.2 10-1 14 1.4.5.3.6.9.3 1.4-.2.4-.8.6-1.4.3z" />
    </svg>
  );
}

function YTMusicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228 18.228 15.432 18.228 12 15.432 5.772 12 5.772zM9.684 15.54V8.46L16.2 12l-6.516 3.54z" />
    </svg>
  );
}

function IconLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="pointillism-icon-link">
      {icon}
    </a>
  );
}

function StippleWave({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`stipple-wave${dark ? " stipple-wave--dark" : ""}`}>
      <div className="stipple-wave-dot" />
      <div className="stipple-wave-dot" />
      <div className="stipple-wave-dot" />
      <div className="stipple-wave-dot" />
      <div className="stipple-wave-dot" />
    </div>
  );
}

function IPodClickWheel() {
  return (
    <div className="ipod-click-wheel" aria-hidden>
      <span className="ipod-wheel-menu">Menu</span>
      <span className="ipod-wheel-back">◀◀</span>
      <span className="ipod-wheel-next">▶▶</span>
      <span className="ipod-wheel-play">▶❚❚</span>
      <i />
    </div>
  );
}

function SectionNote({ index, title, note }: { index: string; title: string; note: string }) {
  return (
    <div className="music-section-note">
      <span>{index}</span>
      <div>
        <h2>{title}</h2>
        <p>{note}</p>
      </div>
    </div>
  );
}

function TabBar({
  active,
  onChange,
}: {
  active: MusicTab;
  onChange: (tab: MusicTab) => void;
}) {
  return (
    <div className="ipod-menu">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <div
            key={tab.id}
            className={isActive ? "pointillism-tab pointillism-tab--active" : "pointillism-tab"}
          >
            <button
              type="button"
              onClick={() => onChange(tab.id)}
              className={`pointillism-tab-inner${isActive ? " pointillism-tab-inner--active" : ""}`}
            >
              <span className="pointillism-tab-icon">{tab.icon}</span>
              {tab.label}
              <span className="ipod-menu-chevron">›</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function SongCard({
  song,
  isPlaying,
  onToggle,
  index,
}: {
  song: Song;
  isPlaying: boolean;
  onToggle: () => void;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const showOverlay = hovered || isPlaying;
  const coverUrl = songCover(song);
  const accent = useAccentColor(coverUrl);

  return (
    <div
      className={
        isPlaying
          ? "pointillism-card-border pointillism-card-border--playing"
          : "pointillism-card-border"
      }
      style={
        {
          "--card-accent": accent ?? "var(--app-border)",
          animationDelay: `${index * 0.07}s`,
        } as CSSProperties
      }
    >
      <div className="pointillism-card">
        <div
          className={`pointillism-cover${showOverlay ? " pointillism-cover--dim" : ""}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={onToggle}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverUrl} alt="" crossOrigin="anonymous" />
          <span className="music-card-index">{trackNumber(index)}</span>
          {showOverlay ? (
            <div className="pointillism-cover-overlay">
              {isPlaying ? (
                <StippleWave />
              ) : (
                <div className="pointillism-play-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--app-ink)" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
            </div>
          ) : null}
        </div>
        <div className="pointillism-card-info">
          <div className="pointillism-card-title">{song.title}</div>
          <div className="pointillism-card-artist">{song.artist}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            {song.spotifyUrl ? <IconLink href={song.spotifyUrl} icon={<SpotifyIcon />} /> : null}
            <IconLink href={songYTMusicUrl(song)} icon={<YTMusicIcon />} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SongsTab({
  songs,
  playingId,
  onToggle,
}: {
  songs: Song[];
  playingId: string | null;
  onToggle: (songId: string) => void;
}) {
  return (
    <section className="music-tab-section">
      <SectionNote index="01" title="The gems" note="Handpicked tracks for the permanent rotation." />
      <div className="music-song-grid">
        {songs.map((song, index) => (
          <SongCard
            key={song.id}
            song={song}
            index={index}
            isPlaying={playingId === song.id}
            onToggle={() => onToggle(song.id)}
          />
        ))}
      </div>
    </section>
  );
}

function HistoryTab({ history }: { history: ListeningHistoryTrack[] }) {
  const [sortBy, setSortBy] = useState<HistorySort>("playCount");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(100);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const sortedHistory = useMemo(() => {
    const filtered = normalizedQuery
      ? history.filter((track) =>
          `${track.title} ${track.artists.join(" ")} ${track.genres.join(" ")}`
            .toLocaleLowerCase()
            .includes(normalizedQuery),
        )
      : history;

    return filtered.toSorted((left, right) => {
      if (sortBy === "title") return left.title.localeCompare(right.title);
      if (sortBy === "artist") return left.artists.join(", ").localeCompare(right.artists.join(", "));
      if (sortBy === "lastPlayed") return right.lastPlayed.localeCompare(left.lastPlayed);
      return right.playCount - left.playCount || right.lastPlayed.localeCompare(left.lastPlayed);
    });
  }, [history, normalizedQuery, sortBy]);

  return (
    <section style={{ padding: "0 20px 24px" }}>
        <SectionNote index="02" title="The replay log" note="Every return visit, sorted your way." />
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 10, color: "var(--app-muted)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          <span>From YouTube Music</span>
          <span>{history.length.toLocaleString()} tracks</span>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <label style={{ flex: "1 1 260px" }}>
            <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0, 0, 0, 0)" }}>Search listening history</span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(100);
              }}
              placeholder="Search songs or artists"
              style={{ width: "100%", minHeight: 36, border: "1px dotted var(--app-border)", borderRadius: 0, background: "var(--app-card)", color: "var(--app-fg)", font: "inherit", padding: "0 11px" }}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--app-muted)", fontSize: 11 }}>
            <span>Sort by</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as HistorySort)} style={{ minHeight: 36, border: "1px dotted var(--app-border)", borderRadius: 0, background: "var(--app-card)", color: "var(--app-fg)", font: "inherit", padding: "0 11px" }}>
              <option value="playCount">Most played</option>
              <option value="lastPlayed">Recently played</option>
              <option value="title">Title</option>
              <option value="artist">Artist</option>
            </select>
          </label>
        </div>
        <div style={{ border: "1px dotted var(--app-border)", background: "var(--app-card)", overflowX: "auto" }}>
          <div aria-hidden style={{ display: "grid", gridTemplateColumns: "36px minmax(220px, 2fr) minmax(110px, 1fr) 60px 110px", alignItems: "center", gap: 10, minWidth: 650, minHeight: 34, padding: "7px 12px", borderBottom: "1px dotted var(--app-border)", color: "var(--app-muted)", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            <span>#</span><span>Song</span><span>Genre</span><span>Plays</span><span>Last played</span>
          </div>
          {sortedHistory.slice(0, visibleCount).map((track, index) => (
            <a
              href={track.youtubeMusicUrl}
              target="_blank"
              rel="noreferrer"
              key={track.id}
              style={{ display: "grid", gridTemplateColumns: "36px minmax(220px, 2fr) minmax(110px, 1fr) 60px 110px", alignItems: "center", gap: 10, minWidth: 650, minHeight: 54, padding: "7px 12px", borderBottom: "1px dotted var(--app-border)", color: "var(--app-muted)", fontSize: 11, textDecoration: "none" }}
            >
              <span style={{ color: "var(--app-fg)", fontVariantNumeric: "tabular-nums" }}>{index + 1}</span>
              <span style={{ minWidth: 0 }}>
                <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--app-fg)", fontSize: 13 }}>{track.title}</strong>
                <small style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 3, color: "var(--app-muted)", fontSize: 11, fontStyle: "italic" }}>{track.artists.join(", ")}</small>
              </span>
              <span>{track.genres.length ? track.genres.join(", ") : "Unclassified"}</span>
              <strong style={{ color: "var(--app-fg)", fontVariantNumeric: "tabular-nums" }}>{track.playCount}</strong>
              <time dateTime={track.lastPlayed}>
                {historyDateFormatter.format(new Date(track.lastPlayed))}
              </time>
            </a>
          ))}
        </div>
        {visibleCount < sortedHistory.length ? (
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + 100)}
            style={{ display: "block", margin: "14px auto 0", border: "1px dotted var(--app-border)", background: "var(--app-card)", color: "var(--app-fg)", padding: "9px 16px", font: "inherit", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
          >
            Show 100 more
          </button>
        ) : null}
        {sortedHistory.length === 0 ? <p style={{ color: "var(--app-muted)", fontSize: 12, textAlign: "center" }}>No matching tracks.</p> : null}
    </section>
  );
}

function PlaylistCard({
  playlist,
  colorIndex,
  index,
}: {
  playlist: Playlist;
  colorIndex: number;
  index: number;
}) {
  const accent = moodAccents[colorIndex % moodAccents.length];
  const bg = moodBgs[colorIndex % moodBgs.length];

  return (
    <div
      className="pointillism-panel"
      style={{
        "--panel-accent": accent,
        animationDelay: `${index * 0.08}s`,
        height: 186,
      } as CSSProperties}
    >
      <div
        className="pointillism-panel-inner"
        style={{ "--panel-bg": bg, height: "100%", minHeight: 0 } as CSSProperties}
      >
        <div className="music-playlist-heading">
          <div className="music-playlist-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={playlist.cover} alt="" />
          </div>
          <span>{trackNumber(index)}</span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--app-fg)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {playlist.name}
          </div>
          {playlist.description ? (
            <div style={{ fontSize: 12, color: "var(--app-muted)", lineHeight: 1.55, fontStyle: "italic", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, overflow: "hidden" }}>
              {playlist.description}
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {playlist.spotifyUrl ? <IconLink href={playlist.spotifyUrl} icon={<SpotifyIcon />} /> : null}
          {playlist.youtubeMusicUrl ? (
            <IconLink href={playlist.youtubeMusicUrl} icon={<YTMusicIcon />} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PlaylistsTab({ playlists }: { playlists: Playlist[] }) {
  return (
    <section className="music-tab-section">
      <SectionNote index="03" title="The mixtape shelf" note="Small worlds, arranged for a specific frequency." />
      <div className="music-playlist-grid">
        {playlists.map((playlist, index) => (
          <PlaylistCard
            key={playlist.id}
            playlist={playlist}
            colorIndex={index}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

function LyricCard({ lyric, index }: { lyric: Lyric; index: number }) {
  const bg = lyricBgs[index % lyricBgs.length];
  const isDark = index % lyricBgs.length === 0;

  return (
    <article
      className="pointillism-lyric"
      style={{ animationDelay: `${index * 0.08}s` } as CSSProperties}
    >
      <div className="pointillism-lyric-inner" style={{ background: bg }}>
        <span className={`music-lyric-index${isDark ? " music-lyric-index--dark" : ""}`}>
          Fragment {String(index + 1).padStart(2, "0")}
        </span>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 500,
            lineHeight: 1.6,
            color: isDark ? "var(--app-fg-inv)" : "var(--app-fg)",
            fontStyle: "italic",
          }}
        >
          &ldquo;{lyric.lyric}&rdquo;
        </p>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: isDark ? "rgba(250,246,240,0.65)" : "var(--app-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 3,
            }}
          >
            {lyric.artist}
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: isDark ? "var(--app-fg-inv)" : "var(--app-fg)",
            }}
          >
            {lyric.song}
          </div>
        </div>
      </div>
    </article>
  );
}

function LyricsTab({ lyrics }: { lyrics: Lyric[] }) {
  return (
    <section className="music-tab-section">
      <SectionNote index="04" title="Lines worth keeping" note="Fragments that followed the music home." />
      <div className="music-lyric-grid">
        {lyrics.map((lyric, index) => (
          <LyricCard key={lyric.id} lyric={lyric} index={index} />
        ))}
      </div>
    </section>
  );
}

function EmbeddedPlayer({ song, onClose }: { song: Song; onClose: () => void }) {
  const { id: videoId, timestamp } = song.playConfig;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const startParam = timestamp ? `&start=${timestamp}` : "";

  return (
    <div className="pointillism-player">
      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1${startParam}`}
        allow="autoplay; encrypted-media"
        style={{
          width: 0,
          height: 0,
          border: "none",
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
        }}
        title="Player"
      />

      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
        <div
          style={{
            width: 36,
            height: 36,
            overflow: "hidden",
            flexShrink: 0,
            border: "1px dotted var(--app-border)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={songCover(song)}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            className="ipod-player-title"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--app-fg)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {song.title}
          </div>
          <div
            className="ipod-player-artist"
            style={{
              fontSize: 11,
              color: "var(--app-muted)",
              fontStyle: "italic",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {song.artist}
          </div>
        </div>
      </div>

      <StippleWave dark />

      <button
        type="button"
        onClick={onClose}
        className="pointillism-icon-link"
        style={{ fontSize: 12, fontWeight: 700 }}
        aria-label="Stop"
      >
        ■
      </button>
    </div>
  );
}

type MusicAppProps = {
  initialSongs?: Song[];
  initialPlaylists?: Playlist[];
  initialLyrics?: Lyric[];
};

function MusicAppContent({ initialSongs, initialPlaylists, initialLyrics }: MusicAppProps) {
  const [tab, setTab] = useState<MusicTab>("songs");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>(initialSongs ?? []);
  const [history, setHistory] = useState<ListeningHistoryTrack[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists ?? []);
  const [lyrics, setLyrics] = useState<Lyric[]>(initialLyrics ?? []);

  useEffect(() => {
    if (!initialSongs) void fetchSongs().then(setSongs);
    if (!initialPlaylists) void fetchPlaylists().then(setPlaylists);
    if (!initialLyrics) void fetchLyrics().then(setLyrics);
    void fetchListeningHistory().then(setHistory);
  }, [initialLyrics, initialPlaylists, initialSongs]);

  const playingSong = playingId ? (songs.find((s) => s.id === playingId) ?? null) : null;
  const handleToggle = useCallback((songId: string) => {
    setPlayingId((prev) => (prev === songId ? null : songId));
  }, []);

  return (
    <>
      <div className="pointillism-content ipod-content">
        <div className="ipod-control-deck">
          <div className="ipod-screen">
            <div className="ipod-screen-status">
              <strong>Music</strong>
              <span>{tabs.find((item) => item.id === tab)?.label}</span>
              <i aria-hidden />
            </div>
            <TabBar active={tab} onChange={setTab} />
          </div>
          <IPodClickWheel />
        </div>
        <div className="ipod-library-panel">
          <div key={tab} className="pointillism-tab-panel">
            {tab === "songs" ? (
              <SongsTab songs={songs} playingId={playingId} onToggle={handleToggle} />
            ) : null}
            {tab === "history" ? <HistoryTab history={history} /> : null}
            {tab === "playlists" ? <PlaylistsTab playlists={playlists} /> : null}
            {tab === "lyrics" ? <LyricsTab lyrics={lyrics} /> : null}
          </div>
        </div>

        {playingSong ? (
          <EmbeddedPlayer song={playingSong} onClose={() => setPlayingId(null)} />
        ) : null}
      </div>
    </>
  );
}

export function MusicApp(props: MusicAppProps = {}) {
  return (
    <AppContent theme={etherealTheme.content}>
      <MusicAppContent {...props} />
    </AppContent>
  );
}

function MusicIcon() {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <rect x="8" y="3" width="32" height="42" rx="5" fill="#F7F7F5" stroke="#9CA3A8" strokeWidth="1.5" />
      <rect x="12" y="7" width="24" height="14" rx="1.5" fill="#B7CAD2" stroke="#68777D" />
      <path d="M14 11h12M14 14h17M14 17h9" stroke="#34464E" strokeWidth="1.2" />
      <circle cx="24" cy="32" r="9" fill="#E6E7E8" stroke="#A7AAAD" />
      <circle cx="24" cy="32" r="3.5" fill="#FAFAFA" stroke="#B8BABC" />
      <path d="M21 25.5h6M18 32h3M27 32h3M22 38h4" stroke="#687177" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export const musicApp: AppDefinition = {
  id: "music",
  title: "Music",
  icon: <MusicIcon />,
  ui: etherealTheme,
  width: 920,
  height: 720,
  minWidth: 520,
  minHeight: 480,
  content: <MusicApp />,
};

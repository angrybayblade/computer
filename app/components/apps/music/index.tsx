"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { FastAverageColor } from "fast-average-color";
import { AppContent } from "../AppContent";
import { type AppDefinition } from "../types";
import { etherealTheme } from "../themes";
import { fetchLyrics, fetchPlaylists, fetchSongs, groupPlaylistsByMood } from "@/lib/music/storage";
import { type Lyric, type Playlist, type Song } from "@/lib/music/types";

type MusicTab = "songs" | "playlists" | "lyrics";

const fac = new FastAverageColor();

const tabs: { id: MusicTab; label: string; icon: string; accent: string }[] = [
  { id: "songs", label: "Songs", icon: "♫", accent: "var(--app-sage)" },
  { id: "playlists", label: "Playlists", icon: "◎", accent: "var(--app-slate)" },
  { id: "lyrics", label: "Lyrics", icon: "✦", accent: "var(--app-peach)" },
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

function StippleAtmosphere() {
  return (
    <div className="pointillism-atmosphere" aria-hidden>
      <div className="pointillism-orb pointillism-orb--1" />
      <div className="pointillism-orb pointillism-orb--2" />
      <div className="pointillism-orb pointillism-orb--3" />
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
    <div style={{ display: "flex", gap: 10, padding: "0 20px 16px", flexWrap: "wrap" }}>
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <div
            key={tab.id}
            className={isActive ? "pointillism-tab pointillism-tab--active" : "pointillism-tab"}
            style={{ "--tab-accent": tab.accent } as CSSProperties}
          >
            <button
              type="button"
              onClick={() => onChange(tab.id)}
              className={`pointillism-tab-inner${isActive ? " pointillism-tab-inner--active" : ""}`}
            >
              <span className="pointillism-tab-icon">{tab.icon}</span>
              {tab.label}
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(168px, 1fr))",
        gap: 14,
        padding: "0 20px 24px",
      }}
    >
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
      style={{ "--panel-accent": accent, animationDelay: `${index * 0.08}s` } as CSSProperties}
    >
      <div className="pointillism-panel-inner" style={{ "--panel-bg": bg } as CSSProperties}>
        <div
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: "var(--app-ink)",
            backgroundImage: "radial-gradient(circle, rgba(26,26,26,0.15) 0.8px, transparent 0.8px)",
            backgroundSize: "3px 3px",
            border: "1px dotted var(--app-border)",
          }}
        >
          ◎
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--app-fg)", marginBottom: 4 }}>
            {playlist.name}
          </div>
          {playlist.description ? (
            <div style={{ fontSize: 12, color: "var(--app-muted)", lineHeight: 1.55, fontStyle: "italic" }}>
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
  const moodGroups = useMemo(() => groupPlaylistsByMood(playlists), [playlists]);

  return (
    <div style={{ display: "grid", gap: 28, padding: "0 20px 24px" }}>
      {moodGroups.map(({ mood, playlists: moodPlaylists }, groupIndex) => (
        <section key={mood}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span
              className="pointillism-section-dot"
              style={{ "--section-accent": moodAccents[groupIndex % moodAccents.length] } as CSSProperties}
            />
            <h2
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 700,
                color: "var(--app-fg)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {mood}
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 14,
            }}
          >
            {moodPlaylists.map((playlist, index) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                colorIndex={groupIndex}
                index={index}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 14,
        padding: "0 20px 24px",
      }}
    >
      {lyrics.map((lyric, index) => (
        <LyricCard key={lyric.id} lyric={lyric} index={index} />
      ))}
    </div>
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

function MusicAppContent() {
  const [tab, setTab] = useState<MusicTab>("songs");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [lyrics, setLyrics] = useState<Lyric[]>([]);

  useEffect(() => {
    void fetchSongs().then(setSongs);
    void fetchPlaylists().then(setPlaylists);
    void fetchLyrics().then(setLyrics);
  }, []);

  const playingSong = playingId ? (songs.find((s) => s.id === playingId) ?? null) : null;

  const handleToggle = useCallback((songId: string) => {
    setPlayingId((prev) => (prev === songId ? null : songId));
  }, []);

  return (
    <>
      <StippleAtmosphere />
      <div className="pointillism-content">
        <header className="pointillism-header">
          <p className="pointillism-header-sub">Personal collection</p>
        </header>

        <TabBar active={tab} onChange={setTab} />
        <div style={{ flex: 1, overflow: "auto" }}>
          <div key={tab} className="pointillism-tab-panel">
            {tab === "songs" ? (
              <SongsTab songs={songs} playingId={playingId} onToggle={handleToggle} />
            ) : null}
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

export function MusicApp() {
  return (
    <AppContent theme={etherealTheme.content}>
      <MusicAppContent />
    </AppContent>
  );
}

function MusicIcon() {
  return (
    <svg viewBox="0 0 36 36" width="100%" height="100%" aria-hidden>
      <rect x="2" y="2" width="32" height="32" fill="#F5EDE3" stroke="#1A1A1A" strokeWidth="1" />
      <circle cx="10" cy="10" r="2.5" fill="#8FA888" />
      <circle cx="18" cy="10" r="2" fill="#9AABB5" />
      <circle cx="26" cy="10" r="1.5" fill="#E8C4A8" />
      <circle cx="10" cy="18" r="1.5" fill="#E8C4A8" />
      <circle cx="18" cy="18" r="2.5" fill="#F4C4C4" />
      <circle cx="26" cy="18" r="2" fill="#8FA888" />
      <circle cx="14" cy="26" r="2" fill="#9AABB5" />
      <circle cx="22" cy="26" r="1.5" fill="#1A1A1A" />
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

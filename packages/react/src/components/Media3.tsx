import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Icons } from "../internal/icons.tsx";
import { AnimatedIcon } from "../internal/animated-icons.tsx";
import { useImagePolicy } from "../provider.tsx";
import { Slider } from "./Slider.tsx";
import { Spinner } from "./Spinner.tsx";

const fmtTime = (s: number) => { if (!Number.isFinite(s)) return "0:00"; const m = Math.floor(s / 60), ss = Math.floor(s % 60); return m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}:${String(ss).padStart(2, "0")}` : `${m}:${String(ss).padStart(2, "0")}`; };

type MediaState = "idle" | "loading" | "ready" | "buffering" | "error";

function useMedia(ref: React.RefObject<HTMLMediaElement | null>) {
  const [state, setState] = useState<MediaState>("idle");
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  useEffect(() => {
    const m = ref.current; if (!m) return;
    const on: Record<string, () => void> = {
      loadstart: () => setState("loading"), loadedmetadata: () => { setDuration(m.duration); setState("ready"); }, canplay: () => setState("ready"),
      waiting: () => setState("buffering"), playing: () => { setState("ready"); setPlaying(true); }, pause: () => setPlaying(false), ended: () => setPlaying(false),
      timeupdate: () => setTime(m.currentTime), error: () => setState("error"), volumechange: () => { setMuted(m.muted); setVolume(m.volume); },
    };
    for (const [k, f] of Object.entries(on)) m.addEventListener(k, f);
    if (m.readyState >= 1) { setDuration(m.duration); setState("ready"); }
    return () => { for (const [k, f] of Object.entries(on)) m.removeEventListener(k, f); };
  }, [ref]);
  return { state, playing, time, duration, muted, volume };
}

export type VideoPlayerProps = { src: string; poster?: string; title: string; captions?: { src: string; label: string; srclang: string }[]; ratio?: string };

/**
 * Video with Orlo controls. Never autoplays with sound. Distinguishes loading, buffering and error,
 * keeps controls reachable by keyboard, and supports the common shortcuts (K/Space, J/L, M, F, C).
 * With images turned off, the poster becomes a designed placeholder and nothing loads until Play.
 */
export function VideoPlayer({ src, poster, title, captions = [], ratio = "16 / 9" }: VideoPlayerProps) {
  const video = useRef<HTMLVideoElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [requested, setRequested] = useState(false);
  const [cc, setCc] = useState(false);
  const [idle, setIdle] = useState(false);
  const m = useMedia(video);
  const images = useImagePolicy();
  const { transition } = useOrloMotion();
  const id = useId();
  useEffect(() => { const v = video.current; if (!v) return; Array.from(v.textTracks).forEach((t) => (t.mode = cc ? "showing" : "hidden")); }, [cc, requested]);
  useEffect(() => { if (!m.playing) return setIdle(false); const t = setTimeout(() => setIdle(true), 2500); return () => clearTimeout(t); }, [m.playing, m.time]);
  const [speed, setSpeed] = useState(1);
  const cycleSpeed = () => {
    const next = speed >= 2 ? 0.75 : Math.round((speed + 0.25) * 100) / 100;
    setSpeed(next);
    if (video.current) video.current.playbackRate = next;
  };
  const toggle = () => { const v = video.current; if (!v) { setRequested(true); return; } v.paused ? v.play().catch(() => {}) : v.pause(); };
  const seek = (s: number) => { const v = video.current; if (v) v.currentTime = Math.max(0, Math.min(v.duration || 0, s)); };
  const fullscreen = () => (document.fullscreenElement ? document.exitFullscreen() : box.current?.requestFullscreen?.())?.catch?.(() => {});
  useEffect(() => { if (requested) video.current?.play().catch(() => {}); }, [requested]);
  return (
    <div ref={box} className="orlo-player" data-idle={idle || undefined} style={{ aspectRatio: ratio }} role="group" aria-label={`Video: ${title}`}
      onPointerMove={() => setIdle(false)}
      onKeyDown={(e) => {
        if ((e.target as HTMLElement).closest("[role=slider]")) return;
        const k = e.key.toLowerCase();
        if (k === " " || k === "k") { e.preventDefault(); toggle(); }
        else if (k === "j") seek(m.time - 10); else if (k === "l") seek(m.time + 10);
        else if (k === "m" && video.current) video.current.muted = !video.current.muted;
        else if (k === "f") fullscreen(); else if (k === "c" && captions.length) setCc((c) => !c);
      }}>
      {requested ? (
        <video ref={video} className="orlo-player__video" src={src} poster={images === "on" ? poster : undefined} playsInline preload="metadata" onClick={toggle} aria-labelledby={`${id}-t`}>
          {captions.map((c) => <track key={c.src} kind="captions" src={c.src} label={c.label} srcLang={c.srclang} />)}
        </video>
      ) : (
        <button type="button" className="orlo-player__poster" onClick={() => setRequested(true)} aria-label={`Play ${title}`} style={images === "on" && poster ? { backgroundImage: `url(${poster})` } : undefined}>
          <span className="orlo-player__big"><Icons.Play size={30} /></span>
          {images !== "on" && <span className="orlo-hint">{title}</span>}
        </button>
      )}
      <AnimatePresence>
        {requested && (m.state === "loading" || m.state === "buffering") && <motion.div className="orlo-player__center" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3 } }} exit={{ opacity: 0 }}><Spinner label={m.state === "buffering" ? "Buffering" : "Loading video"} /></motion.div>}
        {m.state === "error" && <motion.div className="orlo-player__center orlo-player__error" role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Icons.AlertCircle size={24} /><strong>This video can’t be played</strong><span>The file may be missing or in a format your browser doesn’t support.</span><a href={src} download>Download instead</a></motion.div>}
      </AnimatePresence>
      {requested && (
        <motion.div className="orlo-player__controls" animate={{ opacity: idle ? 0 : 1, y: idle ? 8 : 0 }} transition={transition("fade")} onFocus={() => setIdle(false)}>
          <span id={`${id}-t`} className="orlo-visually-hidden">{title}</span>
          <button type="button" className="orlo-icon-button" data-variant="ghost" aria-label={m.playing ? "Pause" : "Play"} onClick={toggle}><AnimatedIcon name="play" active={m.playing} /></button>
          <span className="orlo-player__time">{fmtTime(m.time)}</span>
          <div className="orlo-player__scrub"><Slider label="Seek" hideLabel bubble={false} min={0} max={Math.max(1, m.duration || 1)} step={0.1} value={Math.min(m.time, m.duration || 0)} onValueChange={seek} format={fmtTime} /></div>
          <span className="orlo-player__time">{fmtTime(m.duration)}</span>
          <button type="button" className="orlo-icon-button" data-variant="ghost" aria-label={m.muted ? "Unmute" : "Mute"} aria-pressed={m.muted} onClick={() => video.current && (video.current.muted = !video.current.muted)}>{m.muted || m.volume === 0 ? <Icons.VolumeOff /> : <Icons.Volume2 />}</button>
          <button type="button" className="orlo-button" data-variant="ghost" data-size="sm" aria-label={`Playback speed ${speed}×`} onClick={cycleSpeed}>{speed}×</button>
          {captions.length > 0 && <button type="button" className="orlo-icon-button" data-variant="ghost" aria-label="Captions" aria-pressed={cc} onClick={() => setCc((c) => !c)}><Icons.Captions /></button>}
          <button type="button" className="orlo-icon-button" data-variant="ghost" aria-label="Full screen" onClick={fullscreen}><Icons.Maximize /></button>
        </motion.div>
      )}
    </div>
  );
}

export type AudioPlayerProps = { src: string; title: string; artist?: string };

/** Compact audio player with seek, time, playback rate and skip; shows loading and failure in place. */
export function AudioPlayer({ src, title, artist }: AudioPlayerProps) {
  const audio = useRef<HTMLAudioElement>(null);
  const m = useMedia(audio);
  const [rate, setRate] = useState(1);
  const toggle = () => { const a = audio.current; if (a) (a.paused ? a.play().catch(() => {}) : a.pause()); };
  const seek = (s: number) => { if (audio.current) audio.current.currentTime = s; };
  return (
    <div className="orlo-audio" role="group" aria-label={`Audio: ${title}`} data-state={m.state}>
      <audio ref={audio} src={src} preload="metadata" />
      <button type="button" className="orlo-icon-button orlo-audio__play" data-variant="solid" aria-label={m.playing ? "Pause" : "Play"} onClick={toggle} disabled={m.state === "error"}>
        {m.state === "loading" && m.playing ? <Spinner size="sm" label="Loading" /> : <AnimatedIcon name="play" active={m.playing} />}
      </button>
      <div className="orlo-audio__body">
        <div className="orlo-audio__meta"><strong>{title}</strong>{artist && <span className="orlo-hint">{artist}</span>}</div>
        {m.state === "error" ? <p className="orlo-field__msg" role="alert" style={{ color: "var(--orlo-color-error)" }}>This audio couldn’t be loaded. Check the file or try again later.</p> : (
          <div className="orlo-audio__row">
            <span className="orlo-player__time">{fmtTime(m.time)}</span>
            <div style={{ flex: 1, minInlineSize: 0 }}><Slider label="Seek" hideLabel bubble={false} min={0} max={Math.max(1, m.duration || 1)} step={0.1} value={Math.min(m.time, m.duration || 0)} onValueChange={seek} format={fmtTime} /></div>
            <span className="orlo-player__time">{fmtTime(m.duration)}</span>
          </div>
        )}
      </div>
      <button type="button" className="orlo-button" data-variant="ghost" data-size="sm" aria-label={`Playback speed ${rate}×`} onClick={() => { const r = rate >= 2 ? 0.75 : rate + 0.25; setRate(r); if (audio.current) audio.current.playbackRate = r; }}>{rate}×</button>
    </div>
  );
}

const consentKey = (host: string) => `orlo-consent:${host}`;
const readConsent = (host: string) => { try { return localStorage.getItem(consentKey(host)) === "1"; } catch { return false; } };

export type EmbedProps = {
  src: string;
  title: string;
  /** e.g. "YouTube". Defaults to the host name. */
  provider?: string;
  ratio?: string;
  /** Skip the consent step (only for first-party or already-consented content). */
  consented?: boolean;
  sandbox?: string;
  allow?: string;
  /** ms before showing a "taking longer than usual" fallback. */
  timeout?: number;
  children?: ReactNode;
};

/**
 * Third-party iframe behind an explicit, rememberable choice: nothing is requested from the provider until
 * the person agrees. Sandboxed by default, shows loading and a slow-load fallback with a direct link.
 */
export function Embed({ src, title, provider, ratio = "16 / 9", consented, sandbox = "allow-scripts allow-same-origin allow-popups allow-presentation", allow = "fullscreen; picture-in-picture", timeout = 8000, children }: EmbedProps) {
  const host = (() => { try { return new URL(src).hostname; } catch { return src; } })();
  const [ok, setOk] = useState(!!consented);
  const [remember, setRemember] = useState(false);
  const [phase, setPhase] = useState<"loading" | "loaded" | "slow">("loading");
  const { transition } = useOrloMotion();
  useEffect(() => { if (!consented && readConsent(host)) setOk(true); }, [host, consented]);
  useEffect(() => { if (!ok) return; setPhase("loading"); const t = setTimeout(() => setPhase((p) => (p === "loading" ? "slow" : p)), timeout); return () => clearTimeout(t); }, [ok, src, timeout]);
  return (
    <figure className="orlo-embed" style={{ aspectRatio: ratio }}>
      {!ok ? (
        <div className="orlo-embed__gate">
          <Icons.Globe size={26} />
          <strong>{title}</strong>
          <p className="orlo-hint">This content is hosted by {provider ?? host}. Loading it shares your IP address and may set cookies.</p>
          {children}
          <div className="orlo-embed__actions">
            <button type="button" className="orlo-button" data-variant="solid" data-size="sm" onClick={() => { setOk(true); if (remember) try { localStorage.setItem(consentKey(host), "1"); } catch { /* blocked */ } }}>Load content</button>
            <a className="orlo-button" data-variant="ghost" data-size="sm" href={src} target="_blank" rel="noopener noreferrer">Open on {provider ?? host} <Icons.External size={14} /></a>
          </div>
          <label className="orlo-check" style={{ fontSize: "var(--orlo-text-sm)" }}><input type="checkbox" className="orlo-check__input" checked={remember} onChange={(e) => setRemember(e.target.checked)} /><span className="orlo-check__box" aria-hidden="true"><svg viewBox="0 0 16 16"><path className="tick" d="M3.5 8.5l3 3 6-7" /><path className="dash" d="M4 8h8" /></svg></span><span className="orlo-check__text">Always load content from {host}</span></label>
        </div>
      ) : (
        <>
          <iframe className="orlo-embed__frame" src={src} title={title} sandbox={sandbox} allow={allow} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" onLoad={() => setPhase("loaded")} style={{ opacity: phase === "loaded" ? 1 : 0 }} />
          <AnimatePresence>
            {phase !== "loaded" && (
              <motion.div className="orlo-embed__status" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: transition("fade") }} exit={{ opacity: 0, transition: transition("dismiss") }}>
                {phase === "loading" ? <Spinner label={`Loading ${title}`} /> : <><Icons.Clock size={22} /><strong>Taking longer than usual</strong><a href={src} target="_blank" rel="noopener noreferrer">Open on {provider ?? host}</a></>}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </figure>
  );
}

export type MapViewProps = { lat: number; lon: number; zoom?: number; label: string; ratio?: string };

/**
 * A location without surprise network requests. Shows coordinates, a static schematic and direct links;
 * the interactive OpenStreetMap view loads only after consent (via Embed).
 */
export function MapView({ lat, lon, zoom = 14, label, ratio = "16 / 10" }: MapViewProps) {
  const d = 0.02 * 2 ** (14 - zoom);
  const bbox = [lon - d, lat - d / 2, lon + d, lat + d / 2].map((n) => n.toFixed(5)).join(",");
  const osm = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  const coords = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}, ${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? "E" : "W"}`;
  return (
    <Embed src={osm} title={`Map of ${label}`} provider="OpenStreetMap" ratio={ratio}>
      <div className="orlo-map__schematic" aria-hidden="true"><span className="orlo-map__pin"><Icons.MapPin size={22} /></span></div>
      <p style={{ margin: 0 }}><strong>{label}</strong> · <span className="orlo-hint" style={{ display: "inline" }}>{coords}</span></p>
      <a className="orlo-link-button" href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${zoom}/${lat}/${lon}`} target="_blank" rel="noopener noreferrer">Directions in a new tab</a>
    </Embed>
  );
}

export type DocumentViewerProps = {
  src: string;
  title: string;
  ratio?: string;
  pages?: number;
  initialPage?: number;
  allowDownload?: boolean;
  allowPrint?: boolean;
  onPageChange?: (page: number) => void;
};

/** Same-origin PDF/document preview with Orlo-owned toolbar, zoom, rotate, paging, and download fallback. */
export function DocumentViewer({
  src,
  title,
  ratio = "8.5 / 11",
  pages = 1,
  initialPage = 1,
  allowDownload = true,
  allowPrint = true,
  onPageChange,
}: DocumentViewerProps) {
  const [phase, setPhase] = useState<"loading" | "loaded" | "failed">("loading");
  const [page, setPage] = useState(initialPage);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setPhase("loading");
    const ctl = new AbortController();
    fetch(src, { method: "HEAD", signal: ctl.signal })
      .then((r) => {
        if (!r.ok) setPhase("failed");
      })
      .catch(() => !ctl.signal.aborted && setPhase("failed"));
    return () => ctl.abort();
  }, [src]);

  const changePage = (p: number) => {
    const next = Math.max(1, Math.min(pages, p));
    setPage(next);
    onPageChange?.(next);
  };

  const isImage = /\.(png|jpe?g|svg|webp|gif)$/i.test(src);

  return (
    <figure className="orlo-doc" role="region" aria-label={`Document: ${title}`}>
      <figcaption className="orlo-doc__bar">
        <Icons.FileText size={18} />
        <span className="orlo-doc__title">{title}</span>
        {pages > 1 && (
          <div className="orlo-doc__page-controls">
            <button
              type="button"
              className="orlo-icon-button"
              data-variant="ghost"
              data-size="sm"
              disabled={page <= 1}
              onClick={() => changePage(page - 1)}
              aria-label="Previous page"
            >
              <Icons.ChevronLeft size={16} />
            </button>
            <span className="orlo-hint" style={{ fontSize: "var(--orlo-text-xs)", minInlineSize: "3.5rem", textAlign: "center" }}>
              {page} / {pages}
            </span>
            <button
              type="button"
              className="orlo-icon-button"
              data-variant="ghost"
              data-size="sm"
              disabled={page >= pages}
              onClick={() => changePage(page + 1)}
              aria-label="Next page"
            >
              <Icons.ChevronRight size={16} />
            </button>
          </div>
        )}
        <div className="orlo-doc__zoom-controls">
          <button
            type="button"
            className="orlo-icon-button"
            data-variant="ghost"
            data-size="sm"
            onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.25) * 100) / 100))}
            aria-label="Zoom out"
          >
            <Icons.Minus size={16} />
          </button>
          <span className="orlo-hint" style={{ fontSize: "var(--orlo-text-xs)", minInlineSize: "2.75rem", textAlign: "center" }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            className="orlo-icon-button"
            data-variant="ghost"
            data-size="sm"
            onClick={() => setZoom((z) => Math.min(2.5, Math.round((z + 0.25) * 100) / 100))}
            aria-label="Zoom in"
          >
            <Icons.Plus size={16} />
          </button>
        </div>
        <button
          type="button"
          className="orlo-icon-button"
          data-variant="ghost"
          data-size="sm"
          onClick={() => setRotation((r) => (r + 90) % 360)}
          aria-label="Rotate clockwise"
        >
          <Icons.Refresh size={16} />
        </button>
        {allowPrint && (
          <button
            type="button"
            className="orlo-icon-button"
            data-variant="ghost"
            data-size="sm"
            onClick={() => window.print()}
            aria-label="Print document"
          >
            <Icons.Printer size={16} />
          </button>
        )}
        <a className="orlo-icon-button" data-variant="ghost" data-size="sm" href={src} target="_blank" rel="noopener noreferrer" aria-label="Open in new tab">
          <Icons.External size={16} />
        </a>
        {allowDownload && (
          <a className="orlo-icon-button" data-variant="ghost" data-size="sm" href={src} download aria-label="Download">
            <Icons.Download size={16} />
          </a>
        )}
      </figcaption>
      <div className="orlo-doc__body" style={{ aspectRatio: ratio }}>
        {phase === "failed" ? (
          <div className="orlo-async-msg" role="alert">
            <Icons.FileText size={26} />
            <strong>Preview unavailable</strong>
            <span className="orlo-hint">The document couldn’t be loaded inline.</span>
            {allowDownload && (
              <a className="orlo-button" data-variant="subtle" data-size="sm" href={src} download>
                Download
              </a>
            )}
          </div>
        ) : (
          <div
            className="orlo-doc__viewport"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
              transition: "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
            }}
          >
            {isImage ? (
              <img
                src={src}
                alt={title}
                onLoad={() => setPhase("loaded")}
                onError={() => setPhase("failed")}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", opacity: phase === "loaded" ? 1 : 0 }}
              />
            ) : (
              <iframe
                src={`${src}#page=${page}&toolbar=0&navpanes=0`}
                title={title}
                onLoad={() => setPhase((p) => (p === "failed" ? p : "loaded"))}
                style={{ opacity: phase === "loaded" ? 1 : 0 }}
              />
            )}
            {phase === "loading" && (
              <div className="orlo-embed__status">
                <Spinner label={`Loading ${title}`} />
              </div>
            )}
          </div>
        )}
      </div>
    </figure>
  );
}

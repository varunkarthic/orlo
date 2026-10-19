import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Icons } from "../internal/icons.tsx";
import { Portal } from "../internal/Portal.tsx";
import { useDismiss, useFocusScope, useInertOutside, useScrollLock } from "../internal/hooks.ts";
import { OrloImage } from "./OrloImage.tsx";

export type CarouselProps = { label: string; slides: ReactNode[]; slideWidth?: string; autoplay?: number; /** Keep text selection available for editorial or code slides. */ allowTextSelection?: boolean };

/**
 * Native scroll-snap carousel: touch, trackpad and keyboard scrolling work as the platform intends. Buttons and dots
 * reflect the visible slide. Autoplay is off by default and, when on, has a pause control and stops on hover, focus and reduced motion.
 */
export function Carousel({ label, slides, slideWidth = "85%", autoplay, allowTextSelection = false }: CarouselProps) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(!!autoplay);
  const [hold, setHold] = useState(false);
  const { effective } = useOrloMotion();
  const id = useId();
  const go = useCallback((i: number) => {
    const tr = track.current;
    if (!tr) return;
    const targetIdx = Math.max(0, Math.min(slides.length - 1, i));
    const el = tr.children[targetIdx] as HTMLElement | undefined;
    if (el) {
      tr.scrollTo({ left: el.offsetLeft, behavior: effective === "full" ? "smooth" : "auto" });
    }
  }, [slides.length, effective]);
  useEffect(() => {
    const el = track.current; if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.intersectionRatio > 0.6 && setIndex(Array.from(el.children).indexOf(e.target))), { root: el, threshold: [0.6] });
    Array.from(el.children).forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [slides.length]);
  useEffect(() => {
    if (!autoplay || !playing || hold || effective !== "full") return;
    const t = setTimeout(() => go((index + 1) % slides.length), autoplay);
    return () => clearTimeout(t);
  }, [autoplay, playing, hold, index, slides.length, go, effective]);
  return (
    <section className="orlo-carousel" aria-roledescription="carousel" aria-label={label} onPointerEnter={() => setHold(true)} onPointerLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)}>
      <div ref={track} className="orlo-carousel__track" data-selectable={allowTextSelection || undefined} id={id} tabIndex={0} aria-live={playing ? "off" : "polite"}>
        {slides.map((s, i) => <div key={i} className="orlo-carousel__slide" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`} style={{ flexBasis: slideWidth }}>{s}</div>)}
      </div>
      <div className="orlo-carousel__controls">
        {autoplay && <button type="button" className="orlo-icon-button" data-variant="subtle" data-size="sm" aria-label={playing ? "Stop automatic slide show" : "Start automatic slide show"} onClick={() => setPlaying((p) => !p)}>{playing ? <Icons.Pause size={16} /> : <Icons.Play size={16} />}</button>}
        <button type="button" className="orlo-icon-button" data-variant="subtle" data-size="sm" aria-label="Previous slide" aria-controls={id} disabled={index === 0} onClick={() => go(index - 1)}><Icons.ChevronLeft size={18} /></button>
        <div className="orlo-carousel__dots" role="group" aria-label="Choose slide">
          {slides.map((_, i) => <button key={i} type="button" className="orlo-carousel__dot" aria-label={`Slide ${i + 1}`} aria-current={i === index || undefined} onClick={() => go(i)} />)}
        </div>
        <button type="button" className="orlo-icon-button" data-variant="subtle" data-size="sm" aria-label="Next slide" aria-controls={id} disabled={index === slides.length - 1} onClick={() => go(index + 1)}><Icons.ChevronRight size={18} /></button>
      </div>
    </section>
  );
}

export type BeforeAfterProps = { before: ReactNode; after: ReactNode; label?: string; beforeLabel?: string; afterLabel?: string; ratio?: string };

/** Compare two images by dragging a divider. The divider is a slider (keyboard and screen readers), and both labels stay visible. */
export function BeforeAfter({ before, after, label = "Comparison", beforeLabel = "Before", afterLabel = "After", ratio = "16 / 10" }: BeforeAfterProps) {
  const [v, setV] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const set = (e: React.PointerEvent) => { const r = box.current!.getBoundingClientRect(); setV(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))); };
  return (
    <div ref={box} className="orlo-compare" style={{ aspectRatio: ratio, "--pos": `${v}%` } as React.CSSProperties}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); set(e); }} onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && set(e)}>
      <div className="orlo-compare__layer">{after}<span className="orlo-compare__tag" data-side="end">{afterLabel}</span></div>
      <div className="orlo-compare__layer orlo-compare__before">{before}<span className="orlo-compare__tag" data-side="start">{beforeLabel}</span></div>
      <div className="orlo-compare__handle" role="slider" tabIndex={0} aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v)} aria-valuetext={`${Math.round(v)}% ${beforeLabel.toLowerCase()}`}
        onKeyDown={(e) => { const d = { ArrowLeft: -2, ArrowRight: 2, PageDown: -10, PageUp: 10 }[e.key]; if (d) { e.preventDefault(); setV((x) => Math.max(0, Math.min(100, x + (e.shiftKey ? d * 5 : d)))); } else if (e.key === "Home") setV(0); else if (e.key === "End") setV(100); }}>
        <span aria-hidden="true"><Icons.ChevronLeft size={14} /><Icons.ChevronRight size={14} /></span>
      </div>
    </div>
  );
}

export type LightboxImage = { src: string; alt: string; caption?: ReactNode };
export type LightboxProps = { images: LightboxImage[]; thumbnailRatio?: string; label?: string };

/**
 * Gallery grid that opens full-screen. Arrow keys and swipes move between images, Escape closes and focus returns
 * to the thumbnail. Captions stay readable, and failed images keep their designed placeholder.
 */
export function Lightbox({ images, thumbnailRatio = "1 / 1", label = "Gallery" }: LightboxProps) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <ul className="orlo-gallery" aria-label={label}>
        {images.map((im, i) => (
          <li key={i}><button type="button" className="orlo-gallery__thumb" aria-label={`Open ${im.alt}`} onClick={() => setOpen(i)}><OrloImage src={im.src} alt="" decorative ratio={thumbnailRatio} /></button></li>
        ))}
      </ul>
      <AnimatePresence>{open !== null && <Portal><LightboxView images={images} index={open} setIndex={setOpen} /></Portal>}</AnimatePresence>
    </>
  );
}

function LightboxView({ images, index, setIndex }: { images: LightboxImage[]; index: number; setIndex: (i: number | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const [dir, setDir] = useState(0);
  const { transition, distance } = useOrloMotion();
  useFocusScope(ref, true); useScrollLock(true); useInertOutside(ref, true);
  useDismiss({ open: true, id, onDismiss: () => setIndex(null), refs: [ref], outside: false });
  const go = (d: number) => { const n = index + d; if (n >= 0 && n < images.length) { setDir(d); setIndex(n); } };
  const im = images[index];
  return (
    <motion.div ref={ref} className="orlo-lightbox" role="dialog" aria-modal="true" aria-label={`${im.alt}, image ${index + 1} of ${images.length}`} tabIndex={-1}
      initial={{ opacity: 0 }} animate={{ opacity: 1, transition: transition("overlay") }} exit={{ opacity: 0, transition: transition("dismiss") }}
      onKeyDown={(e) => { if (e.key === "ArrowRight") go(1); else if (e.key === "ArrowLeft") go(-1); }}>
      <div className="orlo-lightbox__bar">
        <span>{index + 1} / {images.length}</span>
        <button type="button" className="orlo-icon-button" data-variant="ghost" aria-label="Close" onClick={() => setIndex(null)}><Icons.X /></button>
      </div>
      <div className="orlo-lightbox__stage">
        <button type="button" className="orlo-icon-button orlo-lightbox__nav" data-variant="subtle" aria-label="Previous image" disabled={index === 0} onClick={() => go(-1)}><Icons.ChevronLeft /></button>
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.figure key={index} className="orlo-lightbox__figure" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.4}
            onDragEnd={(_, info) => { if (info.offset.x < -80) go(1); else if (info.offset.x > 80) go(-1); }}
            initial={{ opacity: 0, x: distance(dir * 40) }} animate={{ opacity: 1, x: 0, transition: transition("shared") }} exit={{ opacity: 0, x: distance(dir * -40), transition: transition("dismiss") }}>
            <OrloImage src={im.src} alt={im.alt} ratio="auto" className="orlo-lightbox__img" />
            {im.caption && <figcaption>{im.caption}</figcaption>}
          </motion.figure>
        </AnimatePresence>
        <button type="button" className="orlo-icon-button orlo-lightbox__nav" data-variant="subtle" aria-label="Next image" disabled={index === images.length - 1} onClick={() => go(1)}><Icons.ChevronRight /></button>
      </div>
    </motion.div>
  );
}

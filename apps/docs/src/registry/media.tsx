import { OrloImage, Carousel, BeforeAfter, Lightbox } from "@orlo/react";
import { gallery, sampleImage, svgImg } from "./shared.tsx";
import type { Doc } from "./types.ts";

export const media: Record<string, Doc> = {
  image: {
    demo: () => <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))", inlineSize: "100%" }}><OrloImage src={sampleImage} alt="Sunset over dark hills" /><OrloImage src="./__missing__.png" alt="Harbour at dusk" maxRetries={1} /><OrloImage alt="No image supplied" ratio="1 / 1" /></div>,
    code: `<OrloImage src={url} alt="Harbour at dusk" ratio="4 / 3" />\n<OrloProvider images="off">…</OrloProvider>`,
    props: [["src", "string", ""], ["alt", "string", "Required."], ["decorative", "boolean", "Silent to assistive tech."], ["ratio", "string", "Reserved before load."], ["maxRetries", "number", "Default 2, with backoff."], ["images", '"on" | "off"', "Per-image override."], ["onStateChange", "(state) => void", "disabled | empty | loading | loaded | failed"]],
    notes: ["Geometry is reserved before load, so nothing shifts.", "Pixels appear only after decode, with a gentle fade.", "Failure is a designed placeholder with Try again, never a broken-image icon.", "Preferences → Images: off turns every Orlo image into a designed placeholder and makes no requests."],
    edge: ["404, 403, 500, corrupt data", "Empty or missing src", "src changed rapidly (stale loads cancelled)", "Unmounted while loading", "Retry succeeds after failure"],
  },
  carousel: {
    demo: () => <div style={{ inlineSize: "100%" }}><Carousel label="Featured" slides={gallery.slice(0, 5).map((g) => <OrloImage key={g.alt} src={g.src} alt={g.alt} ratio="16 / 9" />)} /></div>,
    variants: [{ title: "Autoplay (opt-in)", body: "Pauses on hover and focus, has a stop button, and never runs under reduced motion.", demo: () => <div style={{ inlineSize: "100%" }}><Carousel label="Autoplay" autoplay={3500} slideWidth="100%" slides={gallery.slice(0, 3).map((g) => <OrloImage key={g.alt} src={g.src} alt={g.alt} ratio="21 / 9" />)} /></div> }],
    code: `<Carousel label="Featured" slides={items.map((i) => <Card {...i} />)} />`,
    notes: ["Native scroll-snap: touch, trackpad and keyboard scrolling work as the platform intends.", "Dots and buttons follow the visible slide."], keyboard: [["Tab", "Track, then controls"], ["← / → in track", "Scroll (native)"]], semantics: ["aria-roledescription carousel/slide with “n of m” labels."],
  },
  "before-after": {
    demo: () => <div style={{ inlineSize: "min(100%, 32rem)" }}><BeforeAfter before={<OrloImage src={svgImg('<path d="M0 220 Q100 160 200 210 T400 180 V300 H0Z" fill="#5C574C"/>', "#A39D90")} alt="" decorative ratio="auto" />} after={<OrloImage src={sampleImage} alt="" decorative ratio="auto" />} label="Colour grading comparison" /></div>,
    code: `<BeforeAfter before={<OrloImage src={raw} alt="" decorative />} after={<OrloImage src={graded} alt="" decorative />} />`,
    notes: ["The divider is a slider: keyboard and screen readers can compare too.", "Both labels stay visible, so position isn't the only cue."], keyboard: [["← / →", "Move 2% (Shift: 10%)"], ["Home / End", "Show all before / after"]],
  },
  lightbox: {
    demo: () => <div style={{ inlineSize: "100%" }}><Lightbox images={gallery} /></div>, code: `<Lightbox images={[{ src, alt, caption }]} />`,
    notes: ["Arrow keys and swipes move; Escape closes and focus returns to the thumbnail.", "A failed image keeps its designed placeholder inside the viewer (see the fourth image)."],
    keyboard: [["← / →", "Previous / next"], ["Escape", "Close"]], semantics: ["Modal dialog labelled with the image's alt and position."],
  },
};


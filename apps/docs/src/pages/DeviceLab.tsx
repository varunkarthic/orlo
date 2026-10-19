import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { SegmentedControl, Select, Switch, Badge } from "@orlo/react";
import { useOrloMotion } from "@orlo/motion";
import { PageHeader, H2 } from "../kit.tsx";

const devices = {
  phone: { w: 390, h: 844, label: "Phone 390×844", inset: { top: 47, bottom: 34 } },
  small: { w: 320, h: 640, label: "Small phone 320×640", inset: { top: 24, bottom: 0 } },
  tablet: { w: 820, h: 1180, label: "Tablet 820×1180", inset: { top: 24, bottom: 20 } },
  laptop: { w: 1280, h: 800, label: "Laptop 1280×800", inset: { top: 0, bottom: 0 } },
} as const;
const pagesToTry = [["", "Home"], ["components/dialog/", "Dialog"], ["components/data-grid/", "Data grid"], ["start/examples/", "Examples"], ["foundations/failures/", "Failure gallery"], ["styles/materials/", "Materials"]] as const;

export function DeviceLab({ root }: { root: string }) {
  const [d, setD] = useState<keyof typeof devices>("phone");
  const [landscape, setLandscape] = useState(false);
  const [page, setPage] = useState("components/dialog/");
  const [safe, setSafe] = useState(true);
  const container = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(900);
  const dev = devices[d];
  const [w, h] = landscape ? [dev.h, dev.w] : [dev.w, dev.h];
  const scale = Math.min(1, 560 / h, Math.max(200, Math.min(900, available - 24)) / w);
  const { transition } = useOrloMotion();
  useLayoutEffect(() => {
    if (!container.current) return;
    const resize = () => setAvailable(container.current?.clientWidth ?? 900);
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="wide">
      <PageHeader eyebrow="Develop" title="Device lab" lead="Real Orlo pages in device frames: the pages inside are the actual documentation running at that width, not screenshots." />
      <div className="devicelab__controls">
        <SegmentedControl label="Device" value={d} onValueChange={(v) => setD(v as keyof typeof devices)} options={Object.entries(devices).map(([k, v]) => ({ value: k, label: v.label.split(" ")[0] }))} />
        <div className="devicelab__page"><Select label="Page" value={page} onValueChange={setPage} options={pagesToTry.map(([v, l]) => ({ value: v, label: l }))} /></div>
        <div className="devicelab__options"><Switch label="Landscape" checked={landscape} onCheckedChange={setLandscape} /><Switch label="Show safe areas" checked={safe} onCheckedChange={setSafe} /></div>
      </div>
      <div ref={container} className="devicelab">
        <motion.div className="devicelab__frame" data-kind={d} layout transition={transition("shared")} style={{ inlineSize: w * scale + 24, blockSize: h * scale + 24 }}>
          <iframe key={page} title={`${dev.label} preview of ${page || "home"}`} src={`${root}${page}`} style={{ inlineSize: w, blockSize: h, transform: `scale(${scale})` }} />
          {safe && dev.inset.top > 0 && !landscape && <div aria-hidden="true" className="devicelab__safe" style={{ insetBlockStart: 12, blockSize: dev.inset.top * scale }} />}
          {safe && dev.inset.bottom > 0 && !landscape && <div aria-hidden="true" className="devicelab__safe" style={{ insetBlockEnd: 12, blockSize: dev.inset.bottom * scale }} />}
        </motion.div>
        <p className="devicelab__caption"><span>{w}×{h} CSS px · shown at {Math.round(scale * 100)}%{safe && !landscape && (dev.inset.top || dev.inset.bottom) ? " · shaded edges show safe areas" : ""}</span><Badge tone="neutral">{w < 520 ? "Overlays dock as sheets" : w < 900 ? "Navigation in a sheet" : "Rail + drawer"}</Badge></p>
      </div>
      <H2>What changes by width</H2>
      <table className="doc" tabIndex={0}><thead><tr><th>Width</th><th>Behaviour</th></tr></thead><tbody>
        <tr><td>&lt; 520 px</td><td>Dialogs and popovers dock to the bottom edge; dialog actions stack full-width.</td></tr>
        <tr><td>&lt; 900 px</td><td>Docs navigation moves into a sheet; search collapses to an icon.</td></tr>
        <tr><td>&lt; 1100 px</td><td>Section drawer hides; rail stays.</td></tr>
        <tr><td>&lt; 1280 px</td><td>On-this-page contents hides.</td></tr>
        <tr><td>Any</td><td>Components respond to their container, not the viewport, so a narrow card behaves narrow on a wide screen.</td></tr>
      </tbody></table>
      <p className="orlo-hint">Device frames simulate size and safe areas only; touch, keyboards and orientation sensors are tested separately with Playwright device emulation.</p>
    </div>
  );
}

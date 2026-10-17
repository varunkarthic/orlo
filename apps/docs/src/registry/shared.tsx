export const svgImg = (body: string, bg = "#C2410C") => "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${bg}"/>${body}</svg>`);

export const sampleImage = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0B48C"/><stop offset="1" stop-color="#C2410C"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><circle cx="290" cy="96" r="36" fill="#FBE3D3"/><path d="M0 230 Q90 170 180 214 T400 190 V300 H0Z" fill="#1C1B18"/></svg>');

export const gallery = [
  { src: sampleImage, alt: "Hills at sunset", caption: "Dusk over the hills." },
  { src: svgImg('<circle cx="200" cy="150" r="90" fill="none" stroke="#F7F5F0" stroke-width="28"/>', "#1F5FA8"), alt: "Blue ring", caption: "An open edge, closed." },
  { src: svgImg('<path d="M0 200 L120 90 L220 180 L300 120 L400 210 V300 H0Z" fill="#DDE7D6"/>', "#1F7A4D"), alt: "Green mountains" },
  { src: "./__missing__.png", alt: "Harbour at night (fails to load)", caption: "This one is deliberately broken." },
  { src: svgImg('<rect x="80" y="60" width="240" height="180" rx="24" fill="#F1E6C4"/>', "#8A5A00"), alt: "Ochre card" },
  { src: svgImg('<circle cx="140" cy="150" r="70" fill="#EADCEC"/><circle cx="260" cy="150" r="70" fill="#EADCEC" opacity=".6"/>', "#522A57"), alt: "Two violet circles" },
];

export const people = [{ name: "Ada Lovelace" }, { name: "Grace Hopper" }, { name: "Alan Turing" }, { name: "Katherine Johnson" }, { name: "Edsger Dijkstra" }, { name: "Barbara Liskov" }];
export const eur = (n: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

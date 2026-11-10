// Rechtsgrundlagen je Thema (Bundesrecht), als Links auf gesetze-im-internet.de.
const G = "https://www.gesetze-im-internet.de";
const LAWS = {
  beamtvg: { label: "BeamtVG (Beamtenversorgungsgesetz)", url: `${G}/beamtvg/` },
  bbhv: { label: "BBhV (Bundesbeihilfeverordnung)", url: `${G}/bbhv/` },
  beamtstg26: { label: "§ 26 BeamtStG (Dienstunfähigkeit)", url: `${G}/beamtstg/__26.html` },
  estg19: { label: "§ 19 EStG (Versorgungsbezüge)", url: `${G}/estg/__19.html` },
  estg10: { label: "§ 10 EStG (Sonderausgaben, Basisrente)", url: `${G}/estg/__10.html` },
  vvg: { label: "VVG (Versicherungsvertragsgesetz)", url: `${G}/vvg_2008/` },
  bbesg: { label: "BBesG (Bundesbesoldungsgesetz)", url: `${G}/bbesg/` },
};

export function quellenFor(post: { slug: string; title: string }) {
  const t = `${post.slug} ${post.title}`.toLowerCase();
  const out = new Set<keyof typeof LAWS>();
  if (/pension|ruhegehalt|versorgung|rente|ruhestand/.test(t)) {
    out.add("beamtvg");
    out.add("estg19");
  }
  if (/altersvorsorge|basisrente|rürup|ruerup|steuer|riester/.test(t)) out.add("estg10");
  if (/beihilfe|pkv|krankenversicher|anwartschaft|öffnung|oeffnung/.test(t)) {
    out.add("bbhv");
    out.add("vvg");
  }
  if (/dienstunf|berufsunf|\bbu\b|\bdu\b/.test(t)) {
    out.add("beamtstg26");
    out.add("beamtvg");
    out.add("vvg");
  }
  if (/gehalt|besoldung|anw(ä|ae)rter/.test(t)) out.add("bbesg");
  return [...out].map((k) => LAWS[k]);
}

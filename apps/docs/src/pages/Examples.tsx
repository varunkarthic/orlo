import { useState } from "react";
import { Steps, Alert, Checkbox, Switch as OSwitch, Card, TextField, TextArea, Select, Switch, RadioGroup, Button, Tabs, Avatar, Badge, Table, Progress, AnimatedNumber, Stack, Divider, AlertDialog, useToast, Breadcrumbs, EmptyState } from "@orlo/react";

function Settings() {
  const { toast } = useToast();
  const [name, setName] = useState("Ada Lovelace");
  const [email, setEmail] = useState("ada@example.com");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [tried, setTried] = useState(false);
  const errors = { name: name.trim() ? undefined : "Enter your name.", email: /^\S+@\S+\.\S+$/.test(email) ? undefined : "Enter an address like name@example.com." };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (errors.name || errors.email) { requestAnimationFrame(() => (document.querySelector('form [aria-invalid="true"]') as HTMLElement | null)?.focus()); return; }
    setSaving(true);
    setTimeout(() => { setSaving(false); toast({ title: "Profile saved", tone: "success" }); }, 1200);
  };
  return (
    <form onSubmit={submit} noValidate>
      <Stack gap={5}>
        <Stack direction="row" gap={4} align="center"><Avatar name={name || "?"} size="lg" /><div><strong>{name || "Unnamed"}</strong><span className="orlo-hint">{email}</span></div></Stack>
        <div className="grid">
          <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={tried ? errors.name : undefined} autoComplete="name" />
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={tried ? errors.email : undefined} autoComplete="email" />
        </div>
        <TextArea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} showCount help="Shown on your public profile." />
        <Select label="Language" defaultValue="en" options={[{ value: "en", label: "English" }, { value: "it", label: "Italiano" }, { value: "ar", label: "العربية" }, { value: "ja", label: "日本語" }]} />
        <Divider />
        <RadioGroup legend="Email frequency" name="freq" defaultValue="weekly" orientation="horizontal" options={[{ value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }, { value: "never", label: "Never" }]} />
        <Switch label="Show my profile in search" defaultChecked />
        <Stack direction="row" gap={2} justify="space-between" wrap>
          <AlertDialog title="Delete account?" description="Your projects and files will be removed. This cannot be undone." trigger={<Button variant="danger">Delete account…</Button>}
            footer={(close) => <><Button variant="subtle" onClick={close}>Keep account</Button><Button variant="danger" onClick={close}>Delete</Button></>} />
          <Button type="submit" loading={saving} loadingLabel="Saving">Save profile</Button>
        </Stack>
      </Stack>
    </form>
  );
}

const orders = [
  { id: "A-1042", customer: "Grace Hopper", total: 184.5, status: "Paid" },
  { id: "A-1043", customer: "Alan Turing", total: 62, status: "Due" },
  { id: "A-1044", customer: "Katherine Johnson", total: 420, status: "Paid" },
  { id: "A-1045", customer: "Barbara Liskov", total: 39.9, status: "Overdue" },
];
const eur = new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" });

function Dashboard() {
  const [range, setRange] = useState("30");
  const revenue = range === "7" ? 2140 : range === "30" ? 9862 : 31420;
  return (
    <Stack gap={5}>
      <Breadcrumbs items={[{ label: "Store", href: "#" }, { label: "Overview" }]} />
      <Tabs label="Range" value={range} onValueChange={setRange} items={[{ value: "7", label: "7 days", content: null }, { value: "30", label: "30 days", content: null }, { value: "90", label: "90 days", content: null }]} />
      <div className="grid">
        <Card><span className="orlo-hint">Revenue</span><div style={{ fontSize: "1.75rem", fontWeight: 650 }}><AnimatedNumber value={revenue} format={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }} /></div></Card>
        <Card><span className="orlo-hint">Orders</span><div style={{ fontSize: "1.75rem", fontWeight: 650 }}><AnimatedNumber value={Math.round(revenue / 78)} /></div></Card>
        <Card><Progress label="Monthly goal" value={Math.min(100, (revenue / 12000) * 100)} /></Card>
      </div>
      <Table caption="Recent orders" rowKey={(r) => r.id} rows={orders} columns={[
        { key: "id", header: "Order" },
        { key: "customer", header: "Customer", sortable: true },
        { key: "total", header: "Total", sortable: true, align: "end", render: (r) => eur.format(r.total) },
        { key: "status", header: "Status", render: (r) => <Badge tone={r.status === "Paid" ? "success" : r.status === "Due" ? "warning" : "error"}>{r.status}</Badge> },
      ]} />
      <p className="orlo-hint">Figures are illustrative sample data, not real metrics.</p>
    </Stack>
  );
}


function Wizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: "", email: "", plan: "team", terms: false });
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "error" | "done">("idle");
  const [failNext, setFailNext] = useState(true);
  const errs = step === 0 ? { name: data.name.trim() ? undefined : "Enter your name.", email: /^\S+@\S+\.\S+$/.test(data.email) ? undefined : "Enter an address like name@example.com." } : step === 2 ? { terms: data.terms ? undefined : "Accept the terms to continue." } : {};
  const valid = Object.values(errs).every((e) => !e);
  const labels = ["Account", "Plan", "Confirm"];
  const next = () => { setTried(true); if (!valid) { requestAnimationFrame(() => (document.querySelector('#wizard [aria-invalid="true"]') as HTMLElement | null)?.focus()); return; } setTried(false); setStep((s) => s + 1); };
  const submit = () => {
    setTried(true); if (!valid) return;
    setStatus("pending");
    setTimeout(() => { if (failNext) { setStatus("error"); setFailNext(false); } else setStatus("done"); }, 1600);
  };
  if (status === "done") return <EmptyState title={`Welcome, ${data.name.split(" ")[0]}`} description="Your workspace is ready. (The first attempt failed on purpose; your input survived the retry.)" action={<Button variant="subtle" onClick={() => { setStatus("idle"); setStep(0); setFailNext(true); }}>Start again</Button>} />;
  return (
    <div id="wizard" style={{ display: "grid", gap: 20 }}>
      <Steps steps={labels.map((l, i) => ({ label: l, state: i < step ? "complete" : i === step ? "current" : "upcoming" }))} />
      {step === 0 && <div className="grid"><TextField label="Full name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} error={tried ? errs.name : undefined} autoComplete="name" /><TextField label="Email" type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} error={tried ? errs.email : undefined} autoComplete="email" /></div>}
      {step === 1 && <RadioGroup legend="Plan" name="wplan" value={data.plan} onValueChange={(v) => setData({ ...data, plan: v })} options={[{ value: "solo", label: "Solo", description: "Free" }, { value: "team", label: "Team", description: "€12 per seat" }]} />}
      {step === 2 && <Stack gap={3}><DataListLite rows={[["Name", data.name], ["Email", data.email], ["Plan", data.plan]]} /><Checkbox label="I accept the terms" checked={data.terms} onChange={(e) => setData({ ...data, terms: e.target.checked })} aria-invalid={tried && !!errs.terms ? true : undefined} />{tried && errs.terms && <p className="orlo-field__msg" role="alert" style={{ color: "var(--orlo-color-error)" }}>{errs.terms}</p>}</Stack>}
      {status === "error" && <Alert tone="error" title="Couldn’t create your workspace" action={<Button variant="ghost" onClick={submit}>Try again</Button>}>The server didn’t respond. Nothing was charged and your answers are kept.</Alert>}
      <Stack direction="row" gap={2} justify="space-between" wrap>
        <Button variant="ghost" disabled={step === 0 || status === "pending"} onClick={() => setStep((s) => s - 1)}>Back</Button>
        {step < 2 ? <Button onClick={next}>Continue</Button> : <Button loading={status === "pending"} loadingLabel="Creating workspace" onClick={submit}>Create workspace</Button>}
      </Stack>
      <OSwitch label="Make the next submit fail" checked={failNext} onCheckedChange={setFailNext} />
    </div>
  );
}
const DataListLite = ({ rows }: { rows: [string, string][] }) => <dl className="orlo-datalist">{rows.map(([k, v]) => <div key={k} className="orlo-datalist__row"><dt>{k}</dt><dd>{v || "—"}</dd></div>)}</dl>;

function EmptyInbox() {
  const [composing, setComposing] = useState(false);
  const [sent, setSent] = useState(false);
  return <Card style={{ maxInlineSize: "44rem" }}>
    {composing ? <Stack gap={3}><TextArea label="Message" help="This is a local preview; no message is sent." /><Stack direction="row" gap={2}><Button onClick={() => { setComposing(false); setSent(true); }}>Finish preview</Button><Button variant="subtle" onClick={() => setComposing(false)}>Cancel</Button></Stack></Stack>
      : <EmptyState title={sent ? "Draft preview complete" : "You're all caught up"} description={sent ? "Your message was not sent. This example only demonstrates the compose state." : "New messages will appear here. Nothing needs your attention right now."} action={<Button variant="subtle" onClick={() => setComposing(true)}>Compose</Button>} />}
  </Card>;
}

export function Examples() {
  return (
    <div className="wide">
      <p className="eyebrow">Get started</p>
      <h1>Examples</h1>
      <p className="lead">Real screens assembled only from Orlo components. Submit the form with an empty name to see error focus; delete the account to see a confirmation that will not dismiss itself.</p>
      <h2>Profile settings</h2>
      <Card style={{ maxInlineSize: "44rem" }}><Settings /></Card>
      <h2>Sign-up flow</h2>
      <p>Validation on Continue (focus moves to the first error), Back keeps every answer, the submit holds its geometry while pending, and the first attempt fails so you can see recovery.</p>
      <Card style={{ maxInlineSize: "44rem" }}><Wizard /></Card>
      <h2>Store overview</h2>
      <Dashboard />
      <h2>Empty inbox</h2>
      <EmptyInbox />
    </div>
  );
}

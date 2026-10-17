import { useState } from "react";
import { Card, TextField, TextArea, Select, Switch, RadioGroup, Button, Tabs, Avatar, Badge, Table, Progress, AnimatedNumber, Stack, Divider, AlertDialog, useToast, Breadcrumbs, EmptyState } from "@orlo/react";

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
    if (errors.name || errors.email) { (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus(); return; }
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
const eur = new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" });

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

export function Examples() {
  return (
    <div className="wide">
      <p className="eyebrow">Start</p>
      <h1>Examples</h1>
      <p className="lead">Real screens assembled only from Orlo components. Submit the form with an empty name to see error focus; delete the account to see a confirmation that will not dismiss itself.</p>
      <h2>Profile settings</h2>
      <Card style={{ maxInlineSize: "44rem" }}><Settings /></Card>
      <h2>Store overview</h2>
      <Dashboard />
      <h2>Empty inbox</h2>
      <Card style={{ maxInlineSize: "44rem" }}><EmptyState title="You're all caught up" description="New messages will appear here. Nothing needs your attention right now." action={<Button variant="subtle">Compose</Button>} /></Card>
    </div>
  );
}

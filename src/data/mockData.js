const deviceNames = [
  "atlas-gateway",
  "nova-endpoint",
  "orion-workstation",
  "pulse-router",
  "sentinel-node",
  "vector-laptop",
  "zenith-server",
  "harbor-printer",
  "apex-firewall",
  "matrix-vpn",
];

const operatingSystems = ["Windows 11", "Ubuntu 24.04", "macOS 15", "Debian 12", "Fedora 41", "Windows Server 2025"];
const statuses = ["Healthy", "Watching", "Contained", "Offline"];
const departments = ["SOC", "Finance", "Engineering", "HR", "Legal", "Executive", "Cloud Ops"];
const severityLevels = ["Critical", "High", "Medium", "Low"];
const categories = ["Privileged", "Cloud", "Finance", "Infrastructure", "Personal", "Shared"];

const pad = (value) => String(value).padStart(2, "0");

export const devices = Array.from({ length: 120 }, (_, index) => {
  const id = index + 1;
  const status = statuses[index % statuses.length];
  return {
    id,
    name: `${deviceNames[index % deviceNames.length]}-${pad(id)}`,
    ip: `10.${20 + (index % 8)}.${Math.floor(index / 8) + 10}.${20 + (index % 210)}`,
    os: operatingSystems[index % operatingSystems.length],
    department: departments[index % departments.length],
    status,
    risk: status === "Contained" ? 82 : status === "Watching" ? 55 : status === "Offline" ? 39 : 18,
    upload: 12 + ((index * 7) % 95),
    download: 40 + ((index * 13) % 240),
    connections: 8 + ((index * 11) % 180),
    firewall: index % 9 === 0 ? "Review" : "Protected",
    lastSeen: `${pad((index % 12) + 1)}:${pad((index * 3) % 60)} UTC`,
  };
});

export const vulnerabilities = Array.from({ length: 60 }, (_, index) => {
  const severity = severityLevels[index % severityLevels.length];
  const score = severity === "Critical" ? 9.1 + (index % 8) / 10 : severity === "High" ? 7.2 + (index % 13) / 10 : severity === "Medium" ? 4.4 + (index % 19) / 10 : 1.8 + (index % 17) / 10;
  return {
    id: `CYS-${2026}-${pad(index + 1)}`,
    title: [
      "Outdated package exposure",
      "Weak transport configuration",
      "Unpatched service component",
      "Misconfigured administrative policy",
      "Legacy protocol enabled",
    ][index % 5],
    severity,
    cvss: Number(Math.min(score, 9.9).toFixed(1)),
    description: "Sample finding generated from demo posture telemetry for training and reporting workflows.",
    affectedSystem: devices[(index * 3) % devices.length].name,
    recommendedFix: [
      "Apply the current vendor update and verify service configuration.",
      "Enforce encrypted transport and rotate exposed test secrets.",
      "Disable legacy policy exceptions and document the compensating control.",
      "Move the asset into monitored quarantine until the owner confirms remediation.",
    ][index % 4],
    status: ["Open", "Triaged", "In Remediation", "Accepted Risk"][index % 4],
    discovered: `2026-06-${pad((index % 24) + 1)}`,
  };
});

export const trafficSeries = Array.from({ length: 24 }, (_, index) => ({
  time: `${pad(index)}:00`,
  inbound: 80 + Math.round(Math.sin(index / 2) * 24) + ((index * 17) % 85),
  outbound: 55 + Math.round(Math.cos(index / 3) * 18) + ((index * 11) % 70),
  blocked: 12 + ((index * 5) % 36),
}));

export const threatTimeline = Array.from({ length: 12 }, (_, index) => ({
  time: `${pad(index + 7)}:${pad((index * 5) % 60)}`,
  event: ["Credential anomaly", "Malware signature", "Policy drift", "Data egress spike"][index % 4],
  severity: severityLevels[index % severityLevels.length],
}));

export const activityLogs = Array.from({ length: 36 }, (_, index) => ({
  id: index + 1,
  user: ["Maya Chen", "Elliot Singh", "Noah Brooks", "Ava Patel", "SOC Automation"][index % 5],
  action: [
    "reviewed endpoint telemetry",
    "closed a sample alert",
    "exported a mock compliance report",
    "updated dashboard preferences",
    "bookmarked a Linux command lesson",
  ][index % 5],
  time: `${3 + (index % 9)} min ago`,
}));

export const loginAttempts = Array.from({ length: 16 }, (_, index) => ({
  id: index + 1,
  account: ["admin.training", "analyst.one", "cloud.viewer", "vault.demo"][index % 4],
  location: ["New York, US", "Bengaluru, IN", "Dublin, IE", "Toronto, CA"][index % 4],
  result: index % 5 === 0 ? "Blocked" : "Allowed",
  confidence: 72 + ((index * 7) % 27),
}));

export const passwordEntries = Array.from({ length: 42 }, (_, index) => ({
  id: index + 1,
  label: ["SOC Console", "Cloud Lab", "Firewall Demo", "Training Portal", "Report Archive", "Linux VM"][index % 6],
  username: `demo.user${index + 1}@cyberops.local`,
  category: categories[index % categories.length],
  strength: [92, 78, 44, 63, 88, 35][index % 6],
  favorite: index % 7 === 0,
  duplicate: index % 13 === 0,
  recent: index < 8,
}));

export const linuxLessons = [
  {
    section: "Basic Commands",
    command: "ls",
    explanation: "List directory contents in a guided shell lesson.",
    syntax: "ls -lah /training",
    examples: ["ls", "ls -la", "ls /var/log"],
    mistakes: ["Assuming hidden files appear without -a", "Running commands in the wrong directory"],
  },
  {
    section: "Intermediate Commands",
    command: "grep",
    explanation: "Search text streams and files during log review exercises.",
    syntax: "grep -i \"warning\" app.log",
    examples: ["grep error syslog", "grep -r TODO src"],
    mistakes: ["Forgetting quotes around multi-word patterns", "Using broad recursive searches on huge folders"],
  },
  {
    section: "Advanced Commands",
    command: "awk",
    explanation: "Extract and transform columns from structured text.",
    syntax: "awk '{print $1, $5}' access.log",
    examples: ["awk -F, '{print $2}' users.csv", "awk 'NR>1 {sum+=$3} END {print sum}' data.txt"],
    mistakes: ["Mixing shell and awk quoting", "Forgetting field separators"],
  },
  {
    section: "Kali Linux Commands",
    command: "whatweb",
    explanation: "Shown as an educational example only; the suite never runs discovery tools.",
    syntax: "whatweb https://example.training",
    examples: ["whatweb --help", "whatweb https://lab.local"],
    mistakes: ["Running tools without authorization", "Confusing passive UI examples with live scanning"],
  },
  {
    section: "Networking Commands",
    command: "ss",
    explanation: "Inspect socket summaries in a local learning scenario.",
    syntax: "ss -tulpen",
    examples: ["ss -t", "ss -ltn"],
    mistakes: ["Reading state names without context", "Ignoring process ownership"],
  },
  {
    section: "Permissions",
    command: "chmod",
    explanation: "Practice Linux file permission concepts.",
    syntax: "chmod 640 report.txt",
    examples: ["chmod u+x script.sh", "chmod 755 tools"],
    mistakes: ["Using 777 as a shortcut", "Changing ownership when permission bits are enough"],
  },
  {
    section: "Package Management",
    command: "apt",
    explanation: "Understand package update workflows in Debian-based systems.",
    syntax: "sudo apt update",
    examples: ["apt search nginx", "sudo apt install htop"],
    mistakes: ["Skipping package index updates", "Installing from untrusted sources"],
  },
];

export const notifications = Array.from({ length: 34 }, (_, index) => ({
  id: index + 1,
  type: ["Critical", "Warning", "Information"][index % 3],
  title: [
    "Sample credential anomaly",
    "Firewall rule review requested",
    "Report generation completed",
    "Endpoint posture improved",
  ][index % 4],
  message: "Sample event generated for SOC workflow demonstration.",
  time: `${index + 2} min ago`,
}));

export const monthlyRisk = [
  { month: "Jan", critical: 12, high: 30, medium: 45, low: 60 },
  { month: "Feb", critical: 10, high: 26, medium: 43, low: 58 },
  { month: "Mar", critical: 9, high: 23, medium: 39, low: 54 },
  { month: "Apr", critical: 7, high: 21, medium: 36, low: 49 },
  { month: "May", critical: 6, high: 18, medium: 34, low: 44 },
  { month: "Jun", critical: 4, high: 15, medium: 29, low: 41 },
];

export const riskDistribution = [
  { name: "Critical", value: vulnerabilities.filter((item) => item.severity === "Critical").length, color: "#ef4444" },
  { name: "High", value: vulnerabilities.filter((item) => item.severity === "High").length, color: "#f97316" },
  { name: "Medium", value: vulnerabilities.filter((item) => item.severity === "Medium").length, color: "#eab308" },
  { name: "Low", value: vulnerabilities.filter((item) => item.severity === "Low").length, color: "#22c55e" },
];

export const recommendations = [
  "Prioritize the sample critical findings in the reporting dataset before the presentation.",
  "Review firewall exceptions marked for policy review before the next weekly report.",
  "Increase analyst coverage for unusual login locations in the mock identity feed.",
  "Refresh Linux permissions lessons for new SOC trainees this week.",
];

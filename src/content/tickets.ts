/*
 * Ticket queue content (01-VISION.md §7) — real hands-on fixes styled as
 * resolved service tickets, from 03-CONTENT.md. Only confirmed entries;
 * generic-but-honest resolution notes, easy to edit later.
 */

export interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: "resolved";
  resolution: string;
}

export const TICKETS: Ticket[] = [
  {
    id: "TCK-0001",
    subject: "iPhone repair / troubleshooting",
    category: "HARDWARE · MOBILE",
    status: "resolved",
    resolution: "Hardware/software diagnostic and repair — device returned to full working order.",
  },
  {
    id: "TCK-0002",
    subject: "PC repair / troubleshooting",
    category: "HARDWARE · WORKSTATION",
    status: "resolved",
    resolution: "Hardware/software diagnostic and repair — machine restored to stable operation.",
  },
  {
    id: "TCK-0003",
    subject: "Custom hardware & BIOS recovery",
    category: "HARDWARE · FIRMWARE",
    status: "resolved",
    resolution:
      "Diagnosed core boot failures and reconfigured BIOS settings to restore system functionality and hardware integration.",
  },
  {
    id: "TCK-0004",
    subject: "Hardware upgrades — storage",
    category: "HARDWARE · STORAGE",
    status: "resolved",
    resolution:
      "Installed, initialized, and provisioned new internal storage drives in desktop PCs to expand capacity and improve performance.",
  },
  {
    id: "TCK-0005",
    subject: "Bulk credential resets",
    category: "SECURITY · ACCESS RECOVERY",
    status: "resolved",
    resolution:
      "Used Hiren's BootCD to bypass locked accounts and securely reset local administrator passwords across multiple inaccessible desktop computers.",
  },
  {
    id: "TCK-0006",
    subject: "Client infrastructure hosting",
    category: "INFRASTRUCTURE · CLIENT",
    status: "resolved",
    resolution:
      "Deployed, configured, and actively managed secure localized hosting environments and virtual servers tailored to external client requirements.",
  },
  {
    id: "TCK-0007",
    subject: "Disk & partition management",
    category: "STORAGE · MAINTENANCE",
    status: "resolved",
    resolution:
      "Monitored storage health using Hard Disk Sentinel; safely resized complex drive partitions with AOMEI and MiniTool utilities.",
  },
  {
    id: "TCK-0008",
    subject: "USB data recovery",
    category: "DATA RECOVERY · REMOVABLE MEDIA",
    status: "resolved",
    resolution:
      "Extracted and restored lost, accidentally deleted, or corrupted data from damaged USB flash drives using specialized recovery tools.",
  },
  {
    id: "TCK-0009",
    subject: "Undeletable file lock resolution",
    category: "OS · TROUBLESHOOTING",
    status: "resolved",
    resolution:
      "Resolved undeletable file errors by using netstat to identify locking process IDs and forcing termination via taskkill.",
  },
  {
    id: "TCK-0010",
    subject: "CPU overload mitigation",
    category: "MONITORING · MITIGATION",
    status: "resolved",
    resolution:
      "Investigated and mitigated critical Windows CPU overload alerts on local server nodes, restoring normal resource consumption and network stability.",
  },
];

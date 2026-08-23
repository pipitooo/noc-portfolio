import type { GlyphKind } from "../../content/projects";
import {
  AiOpsGlyph,
  ApGlyph,
  ClusterGlyph,
  DashboardGlyph,
  FirewallGlyph,
  GatewayGlyph,
  ServerGlyph,
} from "./glyphs";

export const GLYPHS: Record<GlyphKind, (p: React.SVGProps<SVGSVGElement>) => React.ReactElement> = {
  dashboard: DashboardGlyph,
  server: ServerGlyph,
  cluster: ClusterGlyph,
  ap: ApGlyph,
  gateway: GatewayGlyph,
  firewall: FirewallGlyph,
  aiops: AiOpsGlyph,
};

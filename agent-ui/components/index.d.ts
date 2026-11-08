/** Agent-UI — window.AgentUI. CSS-first system: markup uses the `.aui-*` classes in bundle.css;
 *  these builders only save retyping it. Everything reads tokens.css custom properties. */

export type NodeKind = 'agent' | 'classify' | 'end' | 'start' | 'note' | 'file' | 'shield' | 'mcp' | 'ifelse' | 'while' | 'approval' | 'transform' | 'state';
/** Which icon tint a node kind gets: agent→tint-agent, logic→tint-logic, end→tint-end, note→tint-note, tool→tint-tool, data→tint-data */
export type NodeFamily = 'agent' | 'logic' | 'end' | 'note' | 'tool' | 'data';
export type IconName = NodeKind | 'play' | 'pencil' | 'hand' | 'cursor' | 'undo' | 'redo' | 'code' | 'plus' | 'chevron' | 'updown' | 'more' | 'copy' | 'trash' | 'schema' | 'external' | 'wand' | 'back' | 'chart' | 'clock' | 'tokens' | 'arrowup' | 'arrowdown' | 'check' | 'close' | 'tree' | 'search' | 'sun' | 'moon' | 'layout' | 'enter' | 'send' | 'attach';

export interface NodeProps {
  kind: NodeKind;
  /** Node name, 12px/500 `text-emphasis` */
  title: string;
  /** Type line under the name, 10px/500 `text-tertiary` (e.g. "Agent") */
  meta?: string;
  /** Branch rows (If/else outcomes, Guardrails Pass/Fail); each gets its own output port */
  branches?: string[];
  /** Ring switches from `shadow-node` to `shadow-node-selected` */
  selected?: boolean;
  /** Hide the input port (Start has none) */
  input?: boolean;
}
export interface PaletteProps { sections: { label: string; items: { kind: NodeKind; label: string }[] }[] }
export interface ButtonProps {
  label?: string; icon?: IconName;
  /** solid = `primary-solid` (the `Code` button) · soft · outline · ghost (icon buttons) · danger */
  variant?: 'solid' | 'soft' | 'outline' | 'ghost' | 'danger';
  /** sm 28px · md 32px (default) · lg 36px */
  size?: 'sm' | 'md' | 'lg';
  /** `radius-full` instead of `radius-lg` — the header and toolbar use pills */
  pill?: boolean; iconOnly?: boolean; ariaLabel?: string; disabled?: boolean;
}
export interface SegmentedItem { icon: IconName; label: string; pressed?: boolean }
export interface ToolbarItem { icon: IconName; label: string; pressed?: boolean; disabled?: boolean }

export interface StatTileProps { label: string; icon?: IconName; value: string; unit?: string; delta: { text: string; good: boolean } | null; foot?: string; series?: number[] | null }
export interface BarChartProps { days: { label: string; segments: { key: string; value: number }[] }[]; keys: { key: string; label: string; cls?: string }[]; width?: number; height?: number; label?: string }
export interface BarsProps { rows: { label: string; value: number; display?: string; kind?: NodeKind; title?: string }[] }
export interface DistributionProps { groups: { name: string; kind?: NodeKind; parts: { label: string; value: number }[] }[] }
export interface DataTableProps { columns: { key: string; label: string; num?: boolean; cls?: string }[]; rows: Record<string, string | number | Node>[]; onRow?: (row: Record<string, unknown>) => void }
export interface GraphThumbProps { nodes: { id: string; x: number; y: number; kind: NodeKind }[]; edges: { source: string; target: string }[]; width?: number; height?: number }
export interface MenuItem { label?: string; icon?: IconName; danger?: boolean; sep?: boolean; onClick?: () => void }
export interface WorkflowCardProps { name: string; status: 'draft' | 'live'; meta?: string; stats?: { v: string; k: string }[]; graph: GraphThumbProps; menu?: MenuItem[] }

export type ChatMessage =
  | { role: 'user'; text: string }
  /** One row per step the run touched: the kind's glyph (a spinner while running), the step name, an optional status word, the response id in `mono`, and the reply (markdown rendered by the consumer, passed as an element) */
  | { role: 'step'; name: string; kind?: NodeKind; state?: 'running' | 'done' | 'error'; status?: string; responseId?: string; reply?: string | HTMLElement };
export interface ChatProps { messages?: ChatMessage[]; placeholder?: string; busy?: boolean; empty?: { title: string; sub?: string }; onSend?: (text: string) => void; onStop?: () => void; onNew?: () => void }

export interface AgentUI {
  version: string;
  icons: Record<IconName, string>;
  family: Record<NodeKind, NodeFamily>;
  icon(name: IconName, size?: number): SVGSVGElement;
  /** 28px tile (24px inside the palette) tinted by family, glyph in `node-ink` */
  tile(kind: NodeKind): HTMLSpanElement;
  Node(props: NodeProps): HTMLDivElement;
  Palette(props: PaletteProps): HTMLDivElement;
  Button(props: ButtonProps): HTMLButtonElement;
  Switch(checked: boolean): HTMLButtonElement;
  Badge(label: string, tone?: 'success' | 'warning' | 'danger' | 'info'): HTMLSpanElement;
  Chip(label: string, icon?: IconName): HTMLButtonElement;
  SegmentedControl(items: SegmentedItem[]): HTMLDivElement;
  Toolbar(items: ToolbarItem[]): HTMLDivElement;
  /** Connector path between two ports: horizontal tangents, control points at the midpoint x (as the source draws them) */
  edgePath(x1: number, y1: number, x2: number, y2: number): string;
  /** ---- Data display ---- */
  PageHeader(props: { title: string; sub?: string; actions?: HTMLElement[] }): HTMLDivElement;
  /** Text segments for filters and time ranges */
  SegmentedText(items: { value: string; label: string; pressed?: boolean }[]): HTMLDivElement;
  Card(props: { title: string; sub?: string; legend?: [string, string][]; body?: HTMLElement; foot?: HTMLElement }): HTMLDivElement;
  Sparkline(series: number[], opts?: { width?: number; height?: number }): SVGSVGElement;
  StatTile(props: StatTileProps): HTMLDivElement;
  BarChart(props: BarChartProps): SVGSVGElement;
  Bars(props: BarsProps): HTMLDivElement;
  Distribution(props: DistributionProps): HTMLDivElement;
  DataTable(props: DataTableProps): HTMLTableElement;
  GraphThumb(props: GraphThumbProps): SVGSVGElement;
  WorkflowCard(props: WorkflowCardProps): HTMLDivElement;
  Menu(items: MenuItem[]): HTMLDivElement;
  EmptyState(props: { icon?: IconName; title: string; sub?: string; action?: HTMLElement }): HTMLDivElement;
  /** ⌘K palette; returns the backdrop element with open(parent?) / close() */
  CommandPalette(props: { placeholder?: string; groups: { label: string; items: { label: string; kind?: NodeKind; icon?: IconName; hint?: string; keywords?: string; onSelect?: () => void }[] }[]; onClose?: () => void }): HTMLDivElement & { open(parent?: HTMLElement): HTMLDivElement; close(): void };
  /** Flips <html data-theme> and remembers it in localStorage('agent-ui.theme') */
  ThemeToggle(): HTMLButtonElement;
  /** Preview (play mode) chat: scrolling log of user pills and step rows, composer pinned at the bottom; send becomes stop while busy */
  Chat(props: ChatProps): HTMLDivElement & { append(m: ChatMessage): HTMLElement; setBusy(b: boolean): void; clear(): void };
  ChatMessage(m: ChatMessage): HTMLDivElement;
  MiniMap(props: { nodes: { id: string; x: number; y: number; w?: number; h?: number; kind: NodeKind }[]; viewport?: { x: number; y: number; w: number; h: number } }): HTMLDivElement;
}
declare global { interface Window { AgentUI: AgentUI } }

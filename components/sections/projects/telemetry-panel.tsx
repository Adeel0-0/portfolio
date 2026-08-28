import type { Project } from "@/data";

/**
 * The default project media: an instrument panel drawn from the project's own
 * data. No screenshots, no assets, nothing to go stale.
 *
 * Everything here is deterministic. The trace is a fixed mix of sines seeded by
 * the project index rather than anything random, because a random path would
 * render differently on the server and the client and blow up hydration.
 */

const VIEW_W = 200;
const VIEW_H = 40;

function tracePoints(seed: number, count = 56): string {
  const points: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    // Three frequencies, so it reads as sampled telemetry rather than a wave.
    const v =
      Math.sin(t * 9 + seed) * 0.3 +
      Math.sin(t * 23 + seed * 2) * 0.15 +
      Math.sin(t * 3.5 + seed * 0.5) * 0.35;
    const y = 34 - (v + 0.8) * 15;
    points.push(`${(t * VIEW_W).toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(" ");
}

/**
 * A 0-100 magnitude for the gauge, or null when there's nothing to draw.
 * "−24%" yields 24: the sign lives in the label, the bar shows the size.
 */
function gaugeFill(value: string): number | null {
  if (!value.includes("%")) return null;
  const parsed = Number.parseFloat(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100
    ? parsed
    : null;
}

export function TelemetryPanel({ project }: { project: Project }) {
  const seed = Number.parseInt(project.index, 10);
  const fill = project.metric ? gaugeFill(project.metric.value) : null;

  return (
    <figure className="overflow-hidden rounded-lg border border-border bg-surface">
      <figcaption className="flex items-center justify-between border-b border-border px-4 py-2.5 font-mono text-[0.625rem] uppercase tracking-[0.2em]">
        <span className="text-muted-foreground">
          Onboard · {project.title}
        </span>
        <span className="flex items-center gap-1.5 text-brand">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-brand"
          />
          REC
        </span>
      </figcaption>

      <div className="flex flex-col gap-5 p-4">
        {project.flow && <FlowDiagram nodes={project.flow} />}

        <svg
          aria-hidden="true"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          className="h-16 w-full"
        >
          {/* Draws itself once the panel lands. SlamIn is the `group` and flips
              data-landed, so this stays a server component and still reacts —
              no client boundary just to know when to start.

              The dash length is a fixed over-estimate of the path rather than a
              measured value: getTotalLength() needs a live DOM node, which
              would force this to render on the client for a purely decorative
              stroke. Anything longer than the path animates identically. */}
          <polyline
            points={tracePoints(seed)}
            fill="none"
            stroke="hsl(var(--signal))"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            opacity="0.75"
            style={
              {
                strokeDasharray: 400,
                // Feeds the `trace` keyframe, which starts from
                // var(--trace-len). Must match the dash length above.
                "--trace-len": "400",
              } as React.CSSProperties
            }
            className="[stroke-dashoffset:0] group-data-[landed=false]:[stroke-dashoffset:400] group-data-[landed=true]:animate-trace"
          />
        </svg>

        {project.metric ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3 font-mono">
              <span
                className={`text-2xl font-bold ${
                  project.metric.best ? "text-best" : "text-foreground"
                }`}
              >
                {project.metric.value}
              </span>
              <span className="text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground">
                {project.metric.label}
              </span>
            </div>
            {fill !== null && (
              <div className="h-1 w-full overflow-hidden rounded-full bg-raised">
                <div
                  className={`h-full rounded-full ${
                    project.metric.best ? "bg-best" : "bg-signal"
                  }`}
                  style={{ width: `${fill}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          /* No metric by design. An em dash is what a timing screen shows for a
             driver with no time set — inventing a number here would be worse. */
          <div className="flex items-baseline justify-between gap-3 font-mono">
            <span className="text-2xl font-bold text-muted-foreground">—</span>
            <span className="text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground">
              No time set
            </span>
          </div>
        )}
      </div>
    </figure>
  );
}

function FlowDiagram({ nodes }: { nodes: string[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
      {nodes.map((node, index) => (
        <li key={node} className="flex items-center gap-1.5">
          <span className="rounded border border-border bg-raised px-2 py-1 font-mono text-[0.625rem] text-foreground">
            {node}
          </span>
          {index < nodes.length - 1 && (
            <span aria-hidden="true" className="font-mono text-xs text-brand">
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

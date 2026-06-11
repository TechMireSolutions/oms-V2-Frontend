"use client";

import { useMemo, useState } from "react";
import GridLayout, { type Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import type { DashboardLayout, WidgetDefinition } from "@oms/dto";
import { Widget } from "./Widget";

interface Props {
  layout: DashboardLayout;
  accessToken?: string;
  /** When true, the grid is draggable/resizable (edit mode for the owner). */
  editable?: boolean;
  width?: number;
  onLayoutChange?: (items: Layout[]) => void;
}

/**
 * Dynamic dashboard grid (Part M).
 * Consumes a DashboardLayout (grid coords + WidgetDefinitions) and renders each
 * widget as a permission-gated card. One widget failing or being access-denied
 * degrades only that card — the grid as a whole never crashes.
 */
export function DashboardGrid({
  layout, accessToken, editable = false, width = 1200, onLayoutChange
}: Props) {
  const widgetById = useMemo(
    () => new Map<string, WidgetDefinition>(layout.widgets.map((w) => [w.id, w])),
    [layout.widgets]
  );

  const [grid, setGrid] = useState<Layout[]>(
    layout.items.map((it) => ({
      i: it.widgetId, x: it.x, y: it.y, w: it.w, h: it.h, minW: it.minW, minH: it.minH
    }))
  );

  return (
    <GridLayout
      className="layout"
      layout={grid}
      cols={layout.cols}
      rowHeight={layout.rowHeight}
      width={width}
      isDraggable={editable}
      isResizable={editable}
      draggableHandle=".drag-handle"
      onLayoutChange={(l) => { setGrid(l); onLayoutChange?.(l); }}
    >
      {layout.items.map((it) => {
        const widget = widgetById.get(it.widgetId);
        return (
          <div key={it.widgetId} className="h-full">
            {editable && <div className="drag-handle absolute right-2 top-2 z-10 cursor-move text-slate-300">⠿</div>}
            {widget
              ? <Widget widget={widget} accessToken={accessToken} />
              : <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-400">
                  Unknown widget: {it.widgetId}
                </div>}
          </div>
        );
      })}
    </GridLayout>
  );
}

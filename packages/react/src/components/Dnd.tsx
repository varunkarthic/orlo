import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { useOrloMotion, elasticResistance } from "@orlo/motion";
import { Portal } from "../internal/Portal.tsx";

export type Coordinates = { x: number; y: number };

export type DragItem = {
  id: string;
  data?: Record<string, unknown>;
  initialRect?: DOMRect | null;
};

export type DragStartEvent = {
  active: DragItem;
  initial: Coordinates;
};

export type DragMoveEvent = {
  active: DragItem;
  delta: Coordinates;
  over: { id: string; data?: Record<string, unknown> } | null;
};

export type DragOverEvent = {
  active: DragItem;
  over: { id: string; data?: Record<string, unknown> } | null;
};

export type DragEndEvent = {
  active: DragItem;
  over: { id: string; data?: Record<string, unknown> } | null;
  delta: Coordinates;
};

export type Modifier = (args: {
  transform: Coordinates;
  active?: DragItem | null;
  activeNodeRect?: DOMRect | null;
}) => Coordinates;

export type CollisionArgs = {
  activeRect: DOMRect;
  droppables: Map<string, { id: string; rect: DOMRect; data?: Record<string, unknown> }>;
};

export type DndAnnouncements = {
  onDragStart?: (id: string) => string;
  onDragOver?: (id: string, overId: string | null) => string;
  onDragEnd?: (id: string, overId: string | null) => string;
  onDragCancel?: (id: string) => string;
};

/* ---------------- Collision detection strategies ---------------- */

export function rectIntersection({ activeRect, droppables }: CollisionArgs): string | null {
  let bestId: string | null = null;
  let maxArea = 0;

  for (const [id, droppable] of droppables.entries()) {
    const r = droppable.rect;
    const left = Math.max(activeRect.left, r.left);
    const right = Math.min(activeRect.right, r.right);
    const top = Math.max(activeRect.top, r.top);
    const bottom = Math.min(activeRect.bottom, r.bottom);

    if (right > left && bottom > top) {
      const area = (right - left) * (bottom - top);
      if (area > maxArea) {
        maxArea = area;
        bestId = id;
      }
    }
  }
  return bestId;
}

export function closestCenter({ activeRect, droppables }: CollisionArgs): string | null {
  const activeCenter = {
    x: activeRect.left + activeRect.width / 2,
    y: activeRect.top + activeRect.height / 2,
  };
  let bestId: string | null = null;
  let minDistance = Infinity;

  for (const [id, droppable] of droppables.entries()) {
    const r = droppable.rect;
    const center = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const dist = Math.hypot(center.x - activeCenter.x, center.y - activeCenter.y);
    if (dist < minDistance) {
      minDistance = dist;
      bestId = id;
    }
  }
  return bestId;
}

/* ---------------- Built-in Modifiers ---------------- */

export const restrictToVerticalAxis: Modifier = ({ transform }) => ({ x: 0, y: transform.y });
export const restrictToHorizontalAxis: Modifier = ({ transform }) => ({ x: transform.x, y: 0 });

export function snapToGrid(size: number): Modifier {
  return ({ transform }) => ({
    x: Math.round(transform.x / size) * size,
    y: Math.round(transform.y / size) * size,
  });
}

export function boundedElastic(bounds: { minX?: number; maxX?: number; minY?: number; maxY?: number }, limit = 60): Modifier {
  return ({ transform }) => {
    let { x, y } = transform;
    if (bounds.minX !== undefined && x < bounds.minX) {
      x = bounds.minX - elasticResistance(bounds.minX - x, limit);
    } else if (bounds.maxX !== undefined && x > bounds.maxX) {
      x = bounds.maxX + elasticResistance(x - bounds.maxX, limit);
    }
    if (bounds.minY !== undefined && y < bounds.minY) {
      y = bounds.minY - elasticResistance(bounds.minY - y, limit);
    } else if (bounds.maxY !== undefined && y > bounds.maxY) {
      y = bounds.maxY + elasticResistance(y - bounds.maxY, limit);
    }
    return { x, y };
  };
}

/* ---------------- Dnd Context ---------------- */

type DroppableEntry = {
  id: string;
  node: HTMLElement;
  data?: Record<string, unknown>;
  disabled?: boolean;
};

type DraggableEntry = {
  id: string;
  node: HTMLElement;
  handleNode?: HTMLElement;
  data?: Record<string, unknown>;
  disabled?: boolean;
};

type DndContextValue = {
  activeId: string | null;
  activeItem: DragItem | null;
  overId: string | null;
  delta: Coordinates;
  rawDelta: Coordinates;
  registerDraggable: (entry: DraggableEntry) => () => void;
  registerDroppable: (entry: DroppableEntry) => () => void;
  startDrag: (id: string, initialPoint: Coordinates) => void;
  moveDrag: (currentPoint: Coordinates) => void;
  drop: () => void;
  cancel: () => void;
  stepKeyboard: (id: string, dir: "up" | "down" | "left" | "right") => void;
};

const DndContextInternal = createContext<DndContextValue | null>(null);

export type DndContextProps = {
  children: ReactNode;
  onDragStart?: (event: DragStartEvent) => void;
  onDragMove?: (event: DragMoveEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  onDragCancel?: () => void;
  collisionDetection?: (args: CollisionArgs) => string | null;
  modifiers?: Modifier[];
  announcements?: DndAnnouncements;
};

export function DndContext({
  children,
  onDragStart,
  onDragMove,
  onDragOver,
  onDragEnd,
  onDragCancel,
  collisionDetection = rectIntersection,
  modifiers,
  announcements,
}: DndContextProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<DragItem | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [delta, setDelta] = useState<Coordinates>({ x: 0, y: 0 });
  const [rawDelta, setRawDelta] = useState<Coordinates>({ x: 0, y: 0 });
  const [ariaMessage, setAriaMessage] = useState<string>("");

  const draggables = useRef<Map<string, DraggableEntry>>(new Map());
  const droppables = useRef<Map<string, DroppableEntry>>(new Map());
  const startPoint = useRef<Coordinates | null>(null);
  const liveOverId = useRef<string | null>(null);
  const liveActiveItem = useRef<DragItem | null>(null);
  const liveDelta = useRef<Coordinates>({ x: 0, y: 0 });

  const registerDraggable = useMemo(
    () => (entry: DraggableEntry) => {
      draggables.current.set(entry.id, entry);
      return () => {
        draggables.current.delete(entry.id);
      };
    },
    []
  );

  const registerDroppable = useMemo(
    () => (entry: DroppableEntry) => {
      droppables.current.set(entry.id, entry);
      return () => {
        droppables.current.delete(entry.id);
      };
    },
    []
  );

  const detectCollisions = (rawCurrent: Coordinates, activeNodeRect: DOMRect | null) => {
    if (!activeNodeRect) return null;
    const currentActiveRect = new DOMRect(
      activeNodeRect.left + rawCurrent.x,
      activeNodeRect.top + rawCurrent.y,
      activeNodeRect.width,
      activeNodeRect.height
    );

    const droppableRects = new Map<string, { id: string; rect: DOMRect; data?: Record<string, unknown> }>();
    for (const [id, entry] of droppables.current.entries()) {
      if (entry.disabled) continue;
      droppableRects.set(id, { id, rect: entry.node.getBoundingClientRect(), data: entry.data });
    }

    return collisionDetection({ activeRect: currentActiveRect, droppables: droppableRects });
  };

  const startDrag = (id: string, initialPoint: Coordinates) => {
    const entry = draggables.current.get(id);
    if (!entry || entry.disabled) return;

    const rect = entry.node.getBoundingClientRect();
    const item: DragItem = { id, data: entry.data, initialRect: rect };
    startPoint.current = initialPoint;
    liveActiveItem.current = item;
    liveOverId.current = null;
    liveDelta.current = { x: 0, y: 0 };

    setActiveId(id);
    setActiveItem(item);
    setOverId(null);
    setDelta({ x: 0, y: 0 });
    setRawDelta({ x: 0, y: 0 });

    const msg = announcements?.onDragStart?.(id) ?? `Picked up draggable item ${id}.`;
    setAriaMessage(msg);

    onDragStart?.({ active: item, initial: initialPoint });
  };

  const moveDrag = (currentPoint: Coordinates) => {
    if (!startPoint.current || !liveActiveItem.current) return;
    const raw = {
      x: currentPoint.x - startPoint.current.x,
      y: currentPoint.y - startPoint.current.y,
    };
    setRawDelta(raw);

    let transformed = raw;
    if (modifiers) {
      for (const modifier of modifiers) {
        transformed = modifier({
          transform: transformed,
          active: liveActiveItem.current,
          activeNodeRect: liveActiveItem.current.initialRect,
        });
      }
    }
    liveDelta.current = transformed;
    setDelta(transformed);

    const over = detectCollisions(transformed, liveActiveItem.current.initialRect ?? null);
    if (over !== liveOverId.current) {
      liveOverId.current = over;
      setOverId(over);
      const msg = announcements?.onDragOver?.(liveActiveItem.current.id, over) ?? (over ? `Draggable item over ${over}.` : "Draggable item is not over any target.");
      setAriaMessage(msg);
      onDragOver?.({ active: liveActiveItem.current, over: over ? { id: over, data: droppables.current.get(over)?.data } : null });
    }

    onDragMove?.({
      active: liveActiveItem.current,
      delta: transformed,
      over: over ? { id: over, data: droppables.current.get(over)?.data } : null,
    });
  };

  const drop = () => {
    if (!liveActiveItem.current) return;
    const finalActive = liveActiveItem.current;
    const finalOverId = liveOverId.current;
    const finalDelta = liveDelta.current;

    setActiveId(null);
    setActiveItem(null);
    setOverId(null);
    setDelta({ x: 0, y: 0 });
    setRawDelta({ x: 0, y: 0 });
    startPoint.current = null;
    liveActiveItem.current = null;
    liveOverId.current = null;

    const msg = announcements?.onDragEnd?.(finalActive.id, finalOverId) ?? (finalOverId ? `Dropped item ${finalActive.id} onto ${finalOverId}.` : `Dropped item ${finalActive.id}.`);
    setAriaMessage(msg);

    onDragEnd?.({
      active: finalActive,
      over: finalOverId ? { id: finalOverId, data: droppables.current.get(finalOverId)?.data } : null,
      delta: finalDelta,
    });
  };

  const cancel = () => {
    if (!liveActiveItem.current) return;
    const id = liveActiveItem.current.id;

    setActiveId(null);
    setActiveItem(null);
    setOverId(null);
    setDelta({ x: 0, y: 0 });
    setRawDelta({ x: 0, y: 0 });
    startPoint.current = null;
    liveActiveItem.current = null;
    liveOverId.current = null;

    const msg = announcements?.onDragCancel?.(id) ?? `Movement cancelled for item ${id}.`;
    setAriaMessage(msg);

    onDragCancel?.();
  };

  const stepKeyboard = (id: string, dir: "up" | "down" | "left" | "right") => {
    const step = 20;
    const cur = liveDelta.current;
    const deltaMap = {
      up: { x: cur.x, y: cur.y - step },
      down: { x: cur.x, y: cur.y + step },
      left: { x: cur.x - step, y: cur.y },
      right: { x: cur.x + step, y: cur.y },
    };
    const next = deltaMap[dir];
    liveDelta.current = next;
    setDelta(next);
    setRawDelta(next);

    if (liveActiveItem.current) {
      const over = detectCollisions(next, liveActiveItem.current.initialRect ?? null);
      if (over !== liveOverId.current) {
        liveOverId.current = over;
        setOverId(over);
        const msg = announcements?.onDragOver?.(liveActiveItem.current.id, over) ?? (over ? `Moved over ${over}.` : "Moved.");
        setAriaMessage(msg);
      }
    }
  };

  const value = useMemo<DndContextValue>(
    () => ({
      activeId,
      activeItem,
      overId,
      delta,
      rawDelta,
      registerDraggable,
      registerDroppable,
      startDrag,
      moveDrag,
      drop,
      cancel,
      stepKeyboard,
    }),
    [activeId, activeItem, overId, delta, rawDelta, registerDraggable, registerDroppable]
  );

  return (
    <DndContextInternal.Provider value={value}>
      {children}
      <span className="orlo-visually-hidden" aria-live="assertive">
        {ariaMessage}
      </span>
    </DndContextInternal.Provider>
  );
}

export function useDndContext() {
  const ctx = useContext(DndContextInternal);
  if (!ctx) throw new Error("useDndContext must be used within a <DndContext>");
  return ctx;
}

/* ---------------- useDraggable ---------------- */

export type UseDraggableOptions = {
  id: string;
  data?: Record<string, unknown>;
  disabled?: boolean;
};

export function useDraggable({ id, data, disabled = false }: UseDraggableOptions) {
  const ctx = useContext(DndContextInternal);
  const nodeRef = useRef<HTMLElement | null>(null);
  const handleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ctx || !nodeRef.current) return;
    return ctx.registerDraggable({
      id,
      node: nodeRef.current,
      handleNode: handleRef.current ?? undefined,
      data,
      disabled,
    });
  }, [ctx, id, data, disabled]);

  const isDragging = ctx?.activeId === id;
  const transform = isDragging ? ctx.delta : null;

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled || e.button !== 0 || !ctx) return;
    if (handleRef.current && !handleRef.current.contains(e.target as Node)) return;

    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture?.(e.pointerId);

    const initialPoint = { x: e.clientX, y: e.clientY };
    ctx.startDrag(id, initialPoint);

    const onPointerMove = (ev: PointerEvent) => {
      ctx.moveDrag({ x: ev.clientX, y: ev.clientY });
    };

    const onPointerUp = (ev: PointerEvent) => {
      try {
        target.releasePointerCapture?.(ev.pointerId);
      } catch {}
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      ctx.drop();
    };

    const onPointerCancel = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      ctx.cancel();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || !ctx) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (isDragging) {
        ctx.drop();
      } else {
        const rect = nodeRef.current?.getBoundingClientRect();
        ctx.startDrag(id, { x: rect?.x ?? 0, y: rect?.y ?? 0 });
      }
    } else if (isDragging) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        ctx.stepKeyboard(id, "up");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        ctx.stepKeyboard(id, "down");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        ctx.stepKeyboard(id, "left");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        ctx.stepKeyboard(id, "right");
      } else if (e.key === "Escape") {
        e.preventDefault();
        ctx.cancel();
      }
    }
  };

  const setNodeRef = (node: HTMLElement | null) => {
    nodeRef.current = node;
  };

  const setHandleRef = (node: HTMLElement | null) => {
    handleRef.current = node;
  };

  return {
    isDragging,
    transform,
    setNodeRef,
    setHandleRef,
    attributes: {
      role: "button" as const,
      tabIndex: disabled ? -1 : 0,
      "aria-grabbed": isDragging,
      "aria-disabled": disabled,
      "aria-roledescription": "draggable item",
    },
    listeners: {
      onPointerDown,
      onKeyDown,
    },
  };
}

/* ---------------- useDroppable ---------------- */

export type UseDroppableOptions = {
  id: string;
  data?: Record<string, unknown>;
  disabled?: boolean;
};

export function useDroppable({ id, data, disabled = false }: UseDroppableOptions) {
  const ctx = useContext(DndContextInternal);
  const nodeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ctx || !nodeRef.current) return;
    return ctx.registerDroppable({
      id,
      node: nodeRef.current,
      data,
      disabled,
    });
  }, [ctx, id, data, disabled]);

  const isOver = ctx?.overId === id;

  const setNodeRef = (node: HTMLElement | null) => {
    nodeRef.current = node;
  };

  return {
    isOver,
    active: ctx?.activeItem ?? null,
    setNodeRef,
  };
}

/* ---------------- Sortable Context & Hooks ---------------- */

type SortableContextValue = {
  items: string[];
  strategy: "vertical" | "horizontal" | "grid";
};

const SortableContextInternal = createContext<SortableContextValue | null>(null);

export type SortableContextProps = {
  items: string[];
  strategy?: "vertical" | "horizontal" | "grid";
  children: ReactNode;
};

export function SortableContext({ items, strategy = "vertical", children }: SortableContextProps) {
  const value = useMemo(() => ({ items, strategy }), [items, strategy]);
  return <SortableContextInternal.Provider value={value}>{children}</SortableContextInternal.Provider>;
}

export function useSortable(options: UseDraggableOptions) {
  const draggable = useDraggable(options);
  const droppable = useDroppable({ id: options.id, data: options.data, disabled: options.disabled });
  const sortableCtx = useContext(SortableContextInternal);

  const index = sortableCtx?.items.indexOf(options.id) ?? -1;

  const setNodeRef = (node: HTMLElement | null) => {
    draggable.setNodeRef(node);
    droppable.setNodeRef(node);
  };

  return {
    ...draggable,
    isOver: droppable.isOver,
    setNodeRef,
    index,
  };
}

/* ---------------- DragOverlay ---------------- */

export type DragOverlayProps = {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function DragOverlay({ children, className = "", style }: DragOverlayProps) {
  const ctx = useContext(DndContextInternal);
  const { transition } = useOrloMotion();

  if (!ctx || !ctx.activeId || !ctx.activeItem?.initialRect) return null;

  const rect = ctx.activeItem.initialRect;
  const x = rect.left + ctx.delta.x;
  const y = rect.top + ctx.delta.y;

  return (
    <Portal>
      <motion.div
        className={`orlo-drag-overlay ${className}`}
        initial={false}
        animate={{
          left: `${x}px`,
          top: `${y}px`,
        }}
        transition={transition("drag")}
        style={{
          position: "fixed",
          inlineSize: `${rect.width}px`,
          blockSize: `${rect.height}px`,
          pointerEvents: "none",
          zIndex: "var(--orlo-z-popover, 1000)",
          ...style,
        }}
      >
        {children}
      </motion.div>
    </Portal>
  );
}

/* ---------------- DropIndicator ---------------- */

export type DropIndicatorProps = {
  orientation?: "horizontal" | "vertical";
  active?: boolean;
  className?: string;
};

export function DropIndicator({ orientation = "horizontal", active = false, className = "" }: DropIndicatorProps) {
  return (
    <div
      className={`orlo-drop-indicator ${className}`}
      data-orientation={orientation}
      data-active={active || undefined}
      aria-hidden="true"
    />
  );
}

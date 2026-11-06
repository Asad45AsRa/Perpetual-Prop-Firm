"use client";

import { useEffect, useRef } from "react";
import type { UTCTimestamp } from "lightweight-charts";
import type { EquityData } from "./types";

// Equity and balance line for one trading account, with the loss limits drawn as dashed lines
// so an admin can see at a glance how close the account is to a breach.
export function EquityChart({ data }: { data: EquityData }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let dispose = () => {};

    // Loaded on demand: the chart library touches the browser, so it must not run during server rendering
    import("lightweight-charts").then(({ createChart, LineStyle }) => {
      const el = ref.current;
      if (cancelled || !el) return;

      const chart = createChart(el, {
        height: 280,
        width: el.clientWidth,
        layout: { background: { color: "transparent" }, textColor: "#9a9a9a" },
        grid: { vertLines: { color: "rgba(255,255,255,0.04)" }, horzLines: { color: "rgba(255,255,255,0.04)" } },
        timeScale: { timeVisible: true, borderVisible: false },
        rightPriceScale: { borderVisible: false },
      });

      const equity = chart.addLineSeries({ color: "#d4b678", lineWidth: 2, title: "Equity" });
      equity.setData(data.points.map((p) => ({ time: p.time as UTCTimestamp, value: p.equity })));
      const balance = chart.addLineSeries({ color: "#8a8a8a", lineWidth: 1, title: "Balance" });
      balance.setData(data.points.map((p) => ({ time: p.time as UTCTimestamp, value: p.balance })));

      const line = (price: number, color: string, title: string) =>
        equity.createPriceLine({ price, color, lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title });
      line(data.dailyLossFloor, "#f59e0b", "Daily loss limit");
      line(data.maxLossFloor, "#f87171", "Max drawdown limit");
      line(data.highWater, "#22c55e", "High-water mark");

      chart.timeScale().fitContent();
      const onResize = () => chart.applyOptions({ width: ref.current?.clientWidth ?? 600 });
      window.addEventListener("resize", onResize);
      dispose = () => {
        window.removeEventListener("resize", onResize);
        chart.remove();
      };
    });

    return () => {
      cancelled = true;
      dispose();
    };
  }, [data]);

  return <div ref={ref} className="w-full" />;
}

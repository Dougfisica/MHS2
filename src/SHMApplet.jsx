import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import "katex/dist/katex.min.css";
import katex from "katex";

/*
 * Applet de Movimento Harmônico Simples — versão 4
 * ▶ Remove TODAS as classes Tailwind. Agora o componente funciona sem Tailwind.
 * ▶ Usa apenas estilos inline / CSS padrão para tamanhos, bordas e layout.
 * ▶ Mantém animação e gráfico.
 */

// Utilitário KaTeX em bloco
function BlockMath({ math }) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(math, {
          throwOnError: false,
          displayMode: true,
        }),
      }}
    />
  );
}

const COLORS = {
  amplitude: "#ef4444",
  frequency: "#22c55e",
  phase: "#8b5cf6",
};

export default function SHMApplet() {
  const [amplitude, setAmplitude] = useState(120);
  const [frequency, setFrequency] = useState(0.5);
  const [phase, setPhase] = useState(0);
  const [t, setT] = useState(0);

  // loop de animação
  useEffect(() => {
    let frame;
    const start = performance.now();
    const loop = (now) => {
      setT((now - start) / 1000);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  const omega = 2 * Math.PI * frequency;
  const x = amplitude * Math.cos(omega * t + phase);

  // dados p/ gráfico
  const data = useMemo(() => {
    const pts = [];
    const totalT = 8;
    const dt = 0.02;
    for (let tau = 0; tau <= totalT; tau += dt) {
      pts.push({ t: +tau.toFixed(2), x: amplitude * Math.cos(omega * tau + phase) });
    }
    return pts;
  }, [amplitude, frequency, phase]);

  // fórmulas KaTeX
  const formula = `x(t)=\\color{${COLORS.amplitude}}{A}\\cos\\!\\left(2\\pi\\color{${COLORS.frequency}}{f}\\,t+\\color{${COLORS.phase}}{\\varphi}\\right)`;
  const formulaNum = `x(t)=\\color{${COLORS.amplitude}}{${amplitude.toFixed(0)}}\\cos\\!\\left(2\\pi\\color{${COLORS.frequency}}{${frequency.toFixed(
    2
  )}}\\,t+\\color{${COLORS.phase}}{${phase.toFixed(2)}}\\right)`;

  /** Estilos reutilizáveis */
  const boxStyle = {
    width: "100%",
    maxWidth: 640, // 40rem ≈ Tailwind's max-w-2xl
    border: "1px solid #d1d5db",
    borderRadius: 6,
    backgroundColor: "#f8fafc",
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, padding: 24 }}
    >
      {/* Equações */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <BlockMath math={formula} />
        <BlockMath math={formulaNum} />
      </div>

      {/* Mola */}
      <div style={{ ...boxStyle, position: "relative", height: 192, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 24, height: "100%", background: "#9ca3af" }} />
        <div
          style={{
            position: "absolute",
            top: "50%",
            height: 4,
            background: "#374151",
            width: `calc(50% + ${x}px - 12px)`,
            left: 12,
            transform: "translateY(-50%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 48,
            height: 48,
            borderRadius: 6,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            background: COLORS.amplitude,
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) translateX(${x}px)`,
          }}
        />
      </div>

      {/* Controles */}
      <div style={{ ...boxStyle, padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* amplitude */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ color: COLORS.amplitude }}>Amplitude A (px): {Math.round(amplitude)}</label>
          <input
            type="range"
            min="20"
            max="200"
            step="1"
            value={amplitude}
            onChange={(e) => setAmplitude(+e.target.value)}
            style={{ accentColor: COLORS.amplitude }}
          />
        </div>
        {/* frequência */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ color: COLORS.frequency }}>Frequência f (Hz): {frequency.toFixed(2)}</label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.01"
            value={frequency}
            onChange={(e) => setFrequency(+e.target.value)}
            style={{ accentColor: COLORS.frequency }}
          />
        </div>
        {/* fase */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ color: COLORS.phase }}>Fase inicial φ (rad): {phase.toFixed(2)}</label>
          <input
            type="range"
            min={-Math.PI}
            max={Math.PI}
            step="0.01"
            value={phase}
            onChange={(e) => setPhase(+e.target.value)}
            style={{ accentColor: COLORS.phase }}
          />
        </div>
      </div>

      {/* Gráfico */}
      <div style={{ ...boxStyle, height: 256 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="t"
              type="number"
              domain={[0, 8]}
              label={{ value: "t (s)", position: "insideBottomRight", offset: -4 }}
            />
            <YAxis
              domain={[-200, 200]}
              label={{ value: "x (px)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip formatter={(v) => `${v.toFixed(1)} px`} />
            <Line
              type="monotone"
              dataKey="x"
              stroke={COLORS.amplitude}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import React, { useMemo, useState, useCallback } from 'react';
import { View, GestureResponderEvent, Text } from 'react-native';
import Svg, { Path, Rect, Line, Circle } from 'react-native-svg';

export default function LineChart({
  data,
  width,
  height,
  stroke = '#2563eb',
  fill,
  cursorColor = '#111827',
  onFocusChange,
  getTooltipText,
  showTooltip = true,
}: {
  data: number[];
  width: number;
  height: number;
  stroke?: string;
  fill?: string;
  cursorColor?: string;
  onFocusChange?: (index: number | null, value?: number) => void;
  getTooltipText?: (index: number, value: number) => string;
  showTooltip?: boolean;
}) {
  const pad = 12;
  const { path, area, pointsCoord } = useMemo(
    () => makePath(data, width, height, pad),
    [data, width, height]
  );

  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const [tipW, setTipW] = useState(0);

  const n = Math.max(1, data.length - 1);
  const w = width - pad * 2;

  const handleTouch = useCallback(
    (e: GestureResponderEvent) => {
      const x = e.nativeEvent.locationX;
      const raw = Math.round(((x - pad) / w) * n);
      const idx = Math.max(0, Math.min(data.length - 1, raw));
      setFocusIndex(idx);
      onFocusChange?.(idx, data[idx]);
    },
    [data, n, onFocusChange, pad, w]
  );

  const handleEnd = useCallback(() => {
    setFocusIndex(null);
    onFocusChange?.(null);
  }, [onFocusChange]);

  const cx = focusIndex != null ? pointsCoord[focusIndex]?.[0] : undefined;
  const cy = focusIndex != null ? pointsCoord[focusIndex]?.[1] : undefined;
  const tipText =
    focusIndex != null && data[focusIndex] != null
      ? getTooltipText?.(focusIndex, data[focusIndex]) ?? String(Math.round(data[focusIndex]))
      : '';

  return (
    <View style={{ width, height }} onTouchStart={handleTouch} onTouchMove={handleTouch} onTouchEnd={handleEnd}>
      <Svg width={width} height={height}>
        <Rect x={0} y={0} width={width} height={height} fill="#ffffff" />
        {/* grid */}
        {Array.from({ length: 4 }).map((_, i) => (
          <Line
            key={i}
            x1={pad}
            x2={width - pad}
            y1={pad + ((height - 2 * pad) * i) / 3}
            y2={pad + ((height - 2 * pad) * i) / 3}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        ))}

        {fill ? <Path d={area} fill={fill} /> : null}
        <Path d={path} fill="none" stroke={stroke} strokeWidth={2} />

        {focusIndex != null && cx != null && cy != null ? (
          <>
            <Line x1={cx} x2={cx} y1={pad} y2={height - pad} stroke={cursorColor} strokeDasharray="4 4" />
            <Circle cx={cx} cy={cy} r={4} fill={cursorColor} />
          </>
        ) : null}
      </Svg>
      {showTooltip && focusIndex != null && cx != null && cy != null ? (
        <View
          pointerEvents="none"
          onLayout={(e) => setTipW(e.nativeEvent.layout.width)}
          style={{
            position: 'absolute',
            left: cx + 8 + tipW > width ? Math.max(4, cx - 8 - tipW) : Math.max(4, cx + 8),
            top: Math.max(4, (cy ?? 0) - 28),
            backgroundColor: '#111827',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: 'white', fontSize: 12 }}>{tipText}</Text>
        </View>
      ) : null}
    </View>
  );
}

function makePath(data: number[], width: number, height: number, pad: number) {
  const w = width - pad * 2;
  const h = height - pad * 2;
  const n = Math.max(1, data.length - 1);

  let min = Math.min(...data);
  let max = Math.max(...data);
  if (min === max) {
    // avoid flatline at center
    const delta = min === 0 ? 1 : Math.abs(min) * 0.05;
    min -= delta;
    max += delta;
  }
  // add 10% padding
  const range = max - min;
  const yMin = min - range * 0.1;
  const yMax = max + range * 0.1;

  const points = data.map((v, i) => {
    const x = pad + (w * i) / n;
    const y = pad + h - ((v - yMin) / (yMax - yMin)) * h;
    return [x, y] as const;
  });

  const path = points.reduce((acc, [x, y], i) => (i === 0 ? `M ${x} ${y}` : acc + ` L ${x} ${y}`), '');
  const area = `${path} L ${pad + w} ${pad + h} L ${pad} ${pad + h} Z`;

  return { path, area, yMin, yMax, pointsCoord: points };
}

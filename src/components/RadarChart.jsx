import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

// 프리미엄 파스텔 & 글래스모피즘 느낌의 팔레트
const PALETTE_A = { stroke: '#8B5CF6', fill: '#C4B5FD' }; // 소프트 바이올렛
const PALETTE_B = { stroke: '#0EA5E9', fill: '#7DD3FC' }; // 스카이 블루

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15,15,35,0.92)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: '12px',
        padding: '10px 16px',
        fontSize: '0.82rem',
        fontWeight: 700,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      }}>
        <div style={{ color: '#A5B4FC', marginBottom: payload[1] ? '4px' : 0 }}>
          {payload[0]?.name}: <strong style={{ color: '#E0E7FF' }}>{Math.round(payload[0]?.value)}점</strong>
        </div>
        {payload[1] && (
          <div style={{ color: '#5EEAD4' }}>
            {payload[1]?.name}: <strong style={{ color: '#CCFBF1' }}>{Math.round(payload[1]?.value)}점</strong>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const CustomDot = (props) => {
  const { cx, cy, color } = props;
  return (
    <circle cx={cx} cy={cy} r={4} fill={color} stroke="white" strokeWidth={1.5} style={{ filter: `drop-shadow(0 0 4px ${color}80)` }} />
  );
};

const RadarChart = ({ data, comparisonData, size = 300, nameA, nameB }) => {
  const chartData = React.useMemo(() => {
    const baseData = data || [];
    if (!comparisonData) return baseData;
    return baseData.map((item, index) => ({
      subject: item.subject,
      A: item.A,
      B: comparisonData[index]?.A || 0,
      fullMark: item.fullMark || 100
    }));
  }, [data, comparisonData]);

  const hasComparison = !!comparisonData;

  return (
    <div style={{ width: '100%', height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="72%" data={chartData}>
          <defs>
            {/* A (상대방/단독) — 바이올렛, 중심 진하고 외곽 옅게 */}
            <radialGradient id="fillA" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#A78BFA" stopOpacity={hasComparison ? 0.55 : 0.7} />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={hasComparison ? 0.1 : 0.22} />
            </radialGradient>
            {/* B (나) — 스카이블루: 더 투명하게 하여 A와 겹쳤을때 mix */}
            <radialGradient id="fillB" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.42} />
              <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0.08} />
            </radialGradient>
            <style>{`
              /* 각도 나눔선 — 매우 은은하게 */
              .recharts-polar-grid-angle line {
                stroke: rgba(148,163,184,0.18) !important;
                stroke-dasharray: 2 4 !important;
              }
            `}</style>
          </defs>

          {/* 동심원 그리드 — 은은한 점선 */}
          <PolarGrid stroke="rgba(139,92,246,0.10)" strokeDasharray="2 4" />

          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
            tickCount={4}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* A 데이터 — 도트 없음, 외곽선만 */}
          <Radar
            name={nameA || (hasComparison ? '상대방' : '나')}
            dataKey="A"
            stroke={PALETTE_A.stroke}
            strokeWidth={hasComparison ? 1.5 : 2}
            fill="url(#fillA)"
            fillOpacity={1}
            dot={false}
            activeDot={{ r: 4, fill: PALETTE_A.stroke, stroke: 'white', strokeWidth: 1.5 }}
          />
          {hasComparison && (
            <Radar
              name={nameB || '나'}
              dataKey="B"
              stroke={PALETTE_B.stroke}
              strokeWidth={1.5}
              fill="url(#fillB)"
              fillOpacity={1}
              dot={false}
              activeDot={{ r: 4, fill: PALETTE_B.stroke, stroke: 'white', strokeWidth: 1.5 }}
            />
          )}
          {hasComparison && (
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '0.8rem', fontWeight: 700, paddingTop: '10px' }}
            />
          )}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart;

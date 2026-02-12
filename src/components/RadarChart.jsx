import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

const RadarChart = ({ data, comparisonData, size = 300 }) => {
  // 데이터가 없거나 로딩 중일 때를 대비한 안전 가드
  const chartData = React.useMemo(() => {
    const baseData = data || [];
    if (!comparisonData) {
      return baseData;
    }

    // data와 comparisonData를 병합
    return baseData.map((item, index) => ({
      subject: item.subject,
      A: item.A, // 첫 번째 데이터 (친구 또는 나)
      B: comparisonData[index]?.A || 0, // 두 번째 데이터 (비교 대상)
      fullMark: item.fullMark || 100
    }));
  }, [data, comparisonData]);

  return (
    <div style={{ width: '100%', height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="var(--glass-border)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name={comparisonData ? "상대방" : "나"}
            dataKey="A"
            stroke="#ec4899"
            fill="#ec4899"
            fillOpacity={0.5}
          />
          {comparisonData && (
            <Radar
              name="나"
              dataKey="B"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.3}
            />
          )}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart;

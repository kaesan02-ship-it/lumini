import React from 'react';
import { Flame } from 'lucide-react';
import RadarChart from '../RadarChart';
import Tooltip from '../Tooltip';
import { ChartSkeleton } from '../Skeleton';
import { getSoulType } from '../../data/soulTypes';

const SoulReportCard = ({ userData, mbtiType, isBoosted }) => {
    return (
        <div className={`stats-card ${isBoosted ? 'boosted' : ''}`}>
            {isBoosted && (
                <div className="boost-badge">
                    <Flame size={12} /> 부스트 활성화 중
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem' }}>
                    내 성향 리포트
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        fontSize: '0.8rem', color: 'var(--primary)', background: 'var(--primary-faint)',
                        padding: '4px 12px', borderRadius: '30px', fontWeight: 800,
                        border: '1px solid var(--primary-glow)'
                    }}>
                        {mbtiType ? getSoulType(mbtiType).soulName : '분석 대기 중'}
                    </div>
                    <div style={{
                        fontSize: '1rem', color: 'var(--text-muted)', background: 'var(--background)',
                        padding: '6px 16px', borderRadius: '30px', fontWeight: 800,
                        border: '1px solid var(--glass-border)'
                    }}>
                        {mbtiType || '?'}
                    </div>
                </div>
            </div>
            
            {userData ? (() => {
                const safeVal = (val) => {
                    const num = Number(val);
                    return isNaN(num) ? 0 : num;
                };
                const E = safeVal(userData.E);
                const O = safeVal(userData.O);
                const A = safeVal(userData.A);
                const C = safeVal(userData.C);
                const N = safeVal(userData.N);
                const H = safeVal(userData.H || 50);

                const chartData = [
                    { subject: '사교성', A: E, fullMark: 100 },
                    { subject: '창의성', A: Math.round(O * 0.6 + E * 0.4) || 0, fullMark: 100 },
                    { subject: '공감력', A: Math.round(A * 0.6 + (100 - N) * 0.4) || 0, fullMark: 100 },
                    { subject: '계획성', A: C, fullMark: 100 },
                    { subject: '자기주도', A: Math.round(C * 0.55 + H * 0.45) || 0, fullMark: 100 },
                    { subject: '유연성', A: O, fullMark: 100 },
                    { subject: '따뜻함', A: A, fullMark: 100 },
                    { subject: '회복탄력', A: Math.round(100 - N) || 0, fullMark: 100 },
                    { subject: '신뢰도', A: H, fullMark: 100 },
                ];

                return (
                    <Tooltip text="AI가 분석한 나의 9가지 소울 성향 지표입니다." position="top">
                        <div style={{ width: '100%', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <RadarChart
                                data={chartData}
                                size={300}
                            />
                        </div>
                    </Tooltip>
                );
            })() : (
                <ChartSkeleton />
            )}
        </div>
    );
};

export default SoulReportCard;

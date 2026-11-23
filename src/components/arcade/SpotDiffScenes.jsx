import React from 'react';

/**
 * Stage 6 ~ Stage 10 초정밀 풀-일러스트 5종 (각 씬마다 10개의 미세 디테일 후보 보유!)
 * - 배경 구름 여러 개 중 딱 1개 사라짐
 * - 새/드래곤의 날개 한쪽 색만 변경
 * - 캐릭터의 모자 색 / 신발 한 짝 색 / 넥타이 색 / 앞치마 주머니 사라짐
 * - 창문 여러 칸 중 1칸 불 꺼짐 / 깃발 1개 사라짐 / 팔레트 물감 1색 사라짐 등
 * 매판 10개 후보 중 무작위 5군데만 달라져서 알아차리기 어렵고 중독성 높은 진짜 틀린그림찾기!
 */

export const VECTOR_PUZZLE_STAGES = [
    {
        id: 'village',
        title: '🏘️ 유럽풍 시계탑 마을',
        difficulty: 'Lv.6 정밀',
        memorizeSec: 35,
        findSec: 70,
        penaltySec: 10,
        diffCount: 5,
        candidates: [
            { id: 'cloud2', label: '하늘 구름 중 1개 사라짐', x: 35, y: 15, rx: 8, ry: 6 },
            { id: 'birdWing', label: '날아가는 새의 한쪽 날개 색 변경', x: 74, y: 17, rx: 6, ry: 6 },
            { id: 'clockHand', label: '시계탑 분침 방향 변경', x: 50, y: 31, rx: 6, ry: 7 },
            { id: 'smoke', label: '왼쪽 지붕 굴뚝 연기 사라짐', x: 24, y: 27, rx: 6, ry: 7 },
            { id: 'winLight', label: '오른쪽 건물 창문 1칸 불 꺼짐', x: 83, y: 50, rx: 5, ry: 6 },
            { id: 'lampLight', label: '가로등 불빛 꺼짐', x: 38, y: 54, rx: 5, ry: 7 },
            { id: 'hatColor', label: '행인의 모자 색 변경', x: 24, y: 69, rx: 5, ry: 5 },
            { id: 'shoeColor', label: '행인의 오른쪽 신발 색 변경', x: 27, y: 89, rx: 5, ry: 5 },
            { id: 'tulip', label: '화단 튤립 중 1송이 사라짐', x: 68, y: 84, rx: 5, ry: 6 },
            { id: 'vane', label: '시계탑 꼭대기 깃발 색 변경', x: 50, y: 10, rx: 5, ry: 6 },
        ],
    },
    {
        id: 'train',
        title: '🚂 증기기관차 기차역',
        difficulty: 'Lv.7 고난도',
        memorizeSec: 40,
        findSec: 75,
        penaltySec: 10,
        diffCount: 5,
        candidates: [
            { id: 'cloud1', label: '하늘 구름 중 1개 사라짐', x: 76, y: 14, rx: 8, ry: 6 },
            { id: 'steam2', label: '기관차 연기 구름 1개 사라짐', x: 35, y: 21, rx: 7, ry: 6 },
            { id: 'headlight', label: '기관차 전조등 불 꺼짐', x: 14, y: 59, rx: 5, ry: 6 },
            { id: 'wheel2', label: '기관차 바퀴 1개 색 변경', x: 34, y: 74, rx: 6, ry: 7 },
            { id: 'curtain', label: '객차 창문 1칸 커튼 색 변경', x: 64, y: 57, rx: 6, ry: 6 },
            { id: 'capBadge', label: '역장 모자 금색 배지 사라짐', x: 84, y: 56, rx: 5, ry: 5 },
            { id: 'tieColor', label: '역장 넥타이 색 변경', x: 84, y: 70, rx: 5, ry: 5 },
            { id: 'leftShoe', label: '역장 왼쪽 신발 색 변경', x: 81, y: 88, rx: 5, ry: 5 },
            { id: 'stationClock', label: '기차역 시계 바늘 변경', x: 54, y: 24, rx: 6, ry: 7 },
            { id: 'flagColor', label: '역장이 든 깃발 색 변경', x: 93, y: 66, rx: 5, ry: 6 },
        ],
    },
    {
        id: 'circus',
        title: '🎪 서커스 대극장',
        difficulty: 'Lv.8 고난도',
        memorizeSec: 40,
        findSec: 75,
        penaltySec: 12,
        diffCount: 5,
        candidates: [
            { id: 'star3', label: '밤하늘 별 1개 사라짐', x: 18, y: 16, rx: 5, ry: 6 },
            { id: 'topFlag', label: '천막 꼭대기 깃발 색 변경', x: 50, y: 11, rx: 6, ry: 6 },
            { id: 'tentStripe', label: '서커스 천막 줄무늬 1칸 색 변경', x: 60, y: 37, rx: 7, ry: 10 },
            { id: 'clownPom', label: '광대 모자 방울 사라짐', x: 30, y: 56, rx: 5, ry: 5 },
            { id: 'bowTie', label: '광대 나비넥타이 색 변경', x: 30, y: 70, rx: 5, ry: 5 },
            { id: 'clownShoe', label: '광대 오른쪽 신발 색 변경', x: 33, y: 89, rx: 5, ry: 5 },
            { id: 'juggleBall', label: '저글링 공 1개 색 변경', x: 20, y: 55, rx: 5, ry: 6 },
            { id: 'balloonPink', label: '풍선 다발 중 1개 사라짐', x: 81, y: 39, rx: 6, ry: 8 },
            { id: 'ticketStar', label: '티켓부스 지붕 별 장식 사라짐', x: 76, y: 65, rx: 5, ry: 6 },
            { id: 'bunting', label: '장식 깃발 1개 색 변경', x: 24, y: 32, rx: 6, ry: 6 },
        ],
    },
    {
        id: 'castle',
        title: '🏰 동화 속 마법 성',
        difficulty: 'Lv.9 극한',
        memorizeSec: 45,
        findSec: 80,
        penaltySec: 12,
        diffCount: 5,
        candidates: [
            { id: 'cloud3', label: '하늘 구름 4개 중 1개 사라짐', x: 20, y: 16, rx: 8, ry: 6 },
            { id: 'dragonWing', label: '드래곤의 한쪽 날개 색 변경', x: 81, y: 20, rx: 7, ry: 7 },
            { id: 'flagLeft', label: '왼쪽 성탑 깃발 색 변경', x: 34, y: 20, rx: 5, ry: 6 },
            { id: 'flagCenter', label: '중앙 성탑 깃발 사라짐', x: 50, y: 10, rx: 5, ry: 6 },
            { id: 'towerWin', label: '오른쪽 탑 창문 불 꺼짐', x: 66, y: 42, rx: 5, ry: 6 },
            { id: 'doorRing', label: '성문 문고리 1개 사라짐', x: 53, y: 66, rx: 5, ry: 6 },
            { id: 'uniHorn', label: '유니콘 뿔 색 변경', x: 25, y: 68, rx: 5, ry: 5 },
            { id: 'rose2', label: '정원 장미 중 1송이 사라짐', x: 15, y: 85, rx: 5, ry: 6 },
            { id: 'duck2', label: '연못 아기오리 1마리 사라짐', x: 79, y: 83, rx: 6, ry: 6 },
            { id: 'bridgeLamp', label: '다리 난간 등불 1개 꺼짐', x: 61, y: 74, rx: 5, ry: 6 },
        ],
    },
    {
        id: 'atelier',
        title: '🎨 화가의 비밀 아틀리에',
        difficulty: 'Lv.10 마스터',
        memorizeSec: 45,
        findSec: 85,
        penaltySec: 12,
        diffCount: 5,
        candidates: [
            { id: 'winCloud', label: '창밖 구름 3개 중 1개 사라짐', x: 20, y: 20, rx: 6, ry: 6 },
            { id: 'canvasSun', label: '이젤 그림 속 태양 사라짐', x: 53, y: 39, rx: 5, ry: 6 },
            { id: 'beret', label: '화가의 베레모 모자 색 변경', x: 74, y: 41, rx: 6, ry: 5 },
            { id: 'pocket', label: '화가 앞치마 주머니 사라짐', x: 74, y: 66, rx: 5, ry: 6 },
            { id: 'painterShoe', label: '화가 왼쪽 신발 색 변경', x: 71, y: 88, rx: 5, ry: 5 },
            { id: 'paletteBlue', label: '팔레트 파란 물감 사라짐', x: 64, y: 58, rx: 5, ry: 5 },
            { id: 'frameTilt', label: '벽 액자 속 꽃 색 변경', x: 85, y: 24, rx: 6, ry: 7 },
            { id: 'brush', label: '붓통의 붓 1자루 사라짐', x: 34, y: 67, rx: 5, ry: 7 },
            { id: 'catCollar', label: '바닥 고양이 목걸이 색 변경', x: 22, y: 82, rx: 6, ry: 5 },
            { id: 'mugDot', label: '탁자 찻잔 무늬 사라짐', x: 42, y: 74, rx: 5, ry: 5 },
        ],
    },
];

/**
 * 초정밀 벡터 일러스트 렌더러 (isDiff(id)가 true인 미세 파츠만 정교하게 변형!)
 */
export const VectorIllustrationScene = ({ stageId, activeDiffIds = [] }) => {
    const has = (id) => activeDiffIds.includes(id);

    if (stageId === 'village') {
        return (
            <svg viewBox="0 0 400 300" style={{ width: '100%', height: 'auto', display: 'block' }}>
                <defs>
                    <linearGradient id="v-sky" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#dbeafe" />
                    </linearGradient>
                </defs>
                <rect width="400" height="300" fill="url(#v-sky)" />
                {/* 구름 4개 중 cloud2만 사라짐 */}
                <g fill="white" opacity="0.92">
                    <ellipse cx="62" cy="42" rx="26" ry="12" /><ellipse cx="78" cy="37" rx="18" ry="10" />
                    {!has('cloud2') && (<><ellipse cx="140" cy="45" rx="24" ry="11" /><ellipse cx="154" cy="40" rx="16" ry="9" /></>)}
                    <ellipse cx="248" cy="36" rx="22" ry="10" /><ellipse cx="262" cy="33" rx="15" ry="8" />
                    <ellipse cx="348" cy="54" rx="25" ry="11" />
                </g>
                {/* 날아가는 새 (한쪽 날개 색만 변경!) */}
                <g transform="translate(295, 50)">
                    <ellipse cx="0" cy="4" rx="11" ry="6" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.3" />
                    <path d="M-2 2 Q-14 -14 -20 -4 Q-10 2 -2 4 Z" fill="#0284c7" stroke="#0f172a" strokeWidth="1.2" />
                    <path d="M2 2 Q14 -14 20 -4 Q10 2 2 4 Z" fill={has('birdWing') ? '#f43f5e' : '#0284c7'} stroke="#0f172a" strokeWidth="1.2" />
                    <circle cx="8" cy="2" r="1.5" fill="#0f172a" />
                </g>
                {/* 도로 & 잔디 */}
                <rect x="0" y="215" width="400" height="85" fill="#cbd5e1" />
                <rect x="0" y="215" width="400" height="12" fill="#86efac" />
                {/* 왼쪽 빨간 지붕 집 + 굴뚝 연기 */}
                <rect x="22" y="135" width="102" height="85" fill="#fef3c7" stroke="#334155" strokeWidth="2" />
                <polygon points="14,138 73,90 132,138" fill="#ef4444" stroke="#334155" strokeWidth="2" />
                <rect x="90" y="92" width="14" height="28" fill="#991b1b" stroke="#334155" strokeWidth="1.5" />
                {!has('smoke') && (
                    <g fill="#f1f5f9" opacity="0.85">
                        <circle cx="97" cy="82" r="6" /><circle cx="104" cy="72" r="8" /><circle cx="112" cy="61" r="6" />
                    </g>
                )}
                <rect x="38" y="155" width="22" height="24" fill="#fde047" stroke="#334155" strokeWidth="1.6" />
                <rect x="78" y="155" width="22" height="24" fill="#fde047" stroke="#334155" strokeWidth="1.6" />
                {/* 중앙 시계탑 */}
                <rect x="168" y="72" width="64" height="148" fill="#fde68a" stroke="#334155" strokeWidth="2" />
                <polygon points="162,72 200,34 238,72" fill="#4f46e5" stroke="#334155" strokeWidth="2" />
                <line x1="200" y1="34" x2="200" y2="18" stroke="#334155" strokeWidth="2" />
                <polygon points="200,18 216,24 200,30" fill={has('vane') ? '#10b981' : '#f43f5e'} stroke="#334155" strokeWidth="1.2" />
                <circle cx="200" cy="94" r="18" fill="white" stroke="#334155" strokeWidth="2" />
                <line x1="200" y1="94" x2="200" y2="82" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="200" y1="94" x2={has('clockHand') ? '189' : '211'} y2="94" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />
                <rect x="187" y="168" width="26" height="52" rx="13" fill="#92400e" stroke="#334155" strokeWidth="2" />
                {/* 오른쪽 파란 지붕 건물 (창문 6개 중 1칸 불 꺼짐) */}
                <rect x="275" y="108" width="102" height="112" fill="#fce7f3" stroke="#334155" strokeWidth="2" />
                <polygon points="268,108 326,70 384,108" fill="#0ea5e9" stroke="#334155" strokeWidth="2" />
                {[0, 1, 2].map((c) =>
                    [0, 1].map((r) => {
                        const isTarget = c === 2 && r === 1;
                        return (
                            <rect
                                key={`w-${c}-${r}`}
                                x={288 + c * 28}
                                y={122 + r * 30}
                                width="18"
                                height="20"
                                fill={isTarget && has('winLight') ? '#334155' : '#fef08a'}
                                stroke="#334155"
                                strokeWidth="1.5"
                            />
                        );
                    })
                )}
                {/* 가로등 */}
                <rect x="150" y="165" width="4" height="55" fill="#334155" />
                <circle cx="152" cy="160" r="8" fill={has('lampLight') ? '#94a3b8' : '#fef08a'} stroke="#334155" strokeWidth="1.5" />
                {/* 행인 캐릭터 (모자 색, 오른쪽 신발 색만 변경!) */}
                <g>
                    <circle cx="96" cy="218" r="10" fill="#fed7aa" stroke="#334155" strokeWidth="1.5" />
                    <path d="M84 214 Q96 198 108 214 Z" fill={has('hatColor') ? '#10b981' : '#ef4444'} stroke="#334155" strokeWidth="1.5" />
                    <rect x="86" y="228" width="20" height="24" rx="5" fill="#3b82f6" stroke="#334155" strokeWidth="1.5" />
                    <rect x="87" y="252" width="7" height="14" fill="#1e293b" />
                    <rect x="98" y="252" width="7" height="14" fill="#1e293b" />
                    <ellipse cx="90" cy="267" rx="7" ry="4" fill="#78350f" stroke="#0f172a" strokeWidth="1.2" />
                    <ellipse cx="103" cy="267" rx="7" ry="4" fill={has('shoeColor') ? '#facc15' : '#78350f'} stroke="#0f172a" strokeWidth="1.2" />
                </g>
                {/* 화단 튤립 4송이 중 1송이 사라짐 */}
                <rect x="242" y="252" width="115" height="22" rx="6" fill="#b45309" stroke="#334155" strokeWidth="1.8" />
                {[256, 274, 294, 314, 336].map((tx, i) => {
                    if (i === 1 && has('tulip')) return null;
                    return (
                        <g key={tx}>
                            <line x1={tx} y1="252" x2={tx} y2="236" stroke="#15803d" strokeWidth="2.2" />
                            <circle cx={tx} cy="234" r="6" fill={i % 2 === 0 ? '#f43f5e' : '#facc15'} stroke="#334155" strokeWidth="1.2" />
                        </g>
                    );
                })}
            </svg>
        );
    }

    if (stageId === 'train') {
        return (
            <svg viewBox="0 0 400 300" style={{ width: '100%', height: 'auto', display: 'block' }}>
                <rect width="400" height="300" fill="#bae6fd" />
                {/* 구름 3개 중 cloud1 사라짐 */}
                <g fill="white" opacity="0.9">
                    <ellipse cx="75" cy="40" rx="28" ry="12" />
                    <ellipse cx="185" cy="36" rx="24" ry="10" />
                    {!has('cloud1') && <ellipse cx="305" cy="42" rx="28" ry="12" />}
                </g>
                {/* 역 지붕 & 시계 */}
                <rect x="175" y="55" width="180" height="12" fill="#991b1b" stroke="#1e293b" strokeWidth="1.8" />
                <rect x="215" y="67" width="4" height="145" fill="#475569" />
                <circle cx="217" cy="72" r="15" fill="white" stroke="#1e293b" strokeWidth="2" />
                <line x1="217" y1="72" x2="217" y2="62" stroke="#0f172a" strokeWidth="2" />
                <line x1="217" y1="72" x2={has('stationClock') ? '208' : '226'} y2="72" stroke="#ef4444" strokeWidth="2" />
                {/* 철로 & 승강장 */}
                <rect x="0" y="218" width="400" height="82" fill="#94a3b8" />
                <line x1="0" y1="232" x2="400" y2="232" stroke="#334155" strokeWidth="4" />
                {/* 증기기관차 연기 3개 중 steam2 사라짐 */}
                <g fill="#f8fafc" opacity="0.9">
                    <circle cx="110" cy="86" r="11" />
                    {!has('steam2') && <circle cx="138" cy="64" r="15" />}
                    <circle cx="174" cy="48" r="17" />
                </g>
                {/* 증기기관차 본체 */}
                <rect x="96" y="96" width="18" height="36" fill="#1e293b" stroke="#0f172a" strokeWidth="1.6" />
                <rect x="58" y="132" width="122" height="72" rx="8" fill="#dc2626" stroke="#0f172a" strokeWidth="2" />
                <rect x="132" y="102" width="52" height="102" fill="#b91c1c" stroke="#0f172a" strokeWidth="2" />
                <rect x="142" y="114" width="32" height="28" fill="#fef08a" stroke="#0f172a" strokeWidth="1.6" />
                {/* 전조등 */}
                <circle cx="56" cy="176" r="9" fill={has('headlight') ? '#475569' : '#fef08a'} stroke="#0f172a" strokeWidth="1.8" />
                {/* 객차 */}
                <rect x="190" y="128" width="112" height="76" rx="6" fill="#2563eb" stroke="#0f172a" strokeWidth="2" />
                {[204, 240, 274].map((wx, idx) => (
                    <g key={wx}>
                        <rect x={wx} y="144" width="24" height="28" rx="3" fill="#fef9c3" stroke="#0f172a" strokeWidth="1.6" />
                        <rect
                            x={wx}
                            y="144"
                            width="24"
                            height="9"
                            fill={idx === 1 && has('curtain') ? '#10b981' : '#f43f5e'}
                            stroke="#0f172a"
                            strokeWidth="1"
                        />
                    </g>
                ))}
                {/* 바퀴 4개 중 wheel2 색 변경 */}
                {[82, 136, 214, 278].map((cx, i) => (
                    <g key={cx}>
                        <circle cx={cx} cy="218" r="16" fill={i === 1 && has('wheel2') ? '#facc15' : '#334155'} stroke="#0f172a" strokeWidth="2" />
                        <circle cx={cx} cy="218" r="6" fill="#e2e8f0" />
                    </g>
                ))}
                {/* 역장 캐릭터 (모자 배지, 넥타이, 왼쪽 신발, 깃발) */}
                <g>
                    <circle cx="336" cy="186" r="12" fill="#fed7aa" stroke="#0f172a" strokeWidth="1.6" />
                    <rect x="322" y="166" width="28" height="12" rx="3" fill="#1e3a8a" stroke="#0f172a" strokeWidth="1.5" />
                    {!has('capBadge') && <circle cx="336" cy="172" r="3.5" fill="#facc15" />}
                    <rect x="322" y="198" width="28" height="38" rx="6" fill="#1d4ed8" stroke="#0f172a" strokeWidth="1.6" />
                    <polygon points="336,200 331,218 336,225 341,218" fill={has('tieColor') ? '#22c55e' : '#ef4444'} />
                    <rect x="325" y="236" width="8" height="24" fill="#0f172a" />
                    <rect x="339" y="236" width="8" height="24" fill="#0f172a" />
                    <ellipse cx="326" cy="263" rx="8" ry="4.5" fill={has('leftShoe') ? '#ef4444' : '#1e293b'} stroke="#0f172a" strokeWidth="1.2" />
                    <ellipse cx="344" cy="263" rx="8" ry="4.5" fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />
                    {/* 역장 깃발 */}
                    <line x1="358" y1="215" x2="368" y2="180" stroke="#0f172a" strokeWidth="2.5" />
                    <polygon points="368,180 390,188 364,198" fill={has('flagColor') ? '#facc15' : '#10b981'} stroke="#0f172a" strokeWidth="1.4" />
                </g>
            </svg>
        );
    }

    if (stageId === 'circus') {
        return (
            <svg viewBox="0 0 400 300" style={{ width: '100%', height: 'auto', display: 'block' }}>
                <rect width="400" height="300" fill="#1e1b4b" />
                {/* 밤하늘 별 5개 중 star3 사라짐 */}
                {[
                    [40, 38], [72, 48], [142, 32], [278, 34], [348, 44],
                ].map(([sx, sy], i) => {
                    if (i === 1 && has('star3')) return null;
                    return <circle key={i} cx={sx} cy={sy} r="3.5" fill="#fef08a" />;
                })}
                <rect x="0" y="220" width="400" height="80" fill="#15803d" />
                {/* 서커스 대천막 */}
                <polygon points="90,130 200,45 310,130" fill="#ef4444" stroke="#0f172a" strokeWidth="2" />
                <polygon points="135,130 200,45 200,130" fill="#fef9c3" />
                <polygon points="200,45 265,130 225,130" fill={has('tentStripe') ? '#38bdf8' : '#fef9c3'} />
                <rect x="102" y="130" width="196" height="92" fill="#fee2e2" stroke="#0f172a" strokeWidth="2" />
                <path d="M174 222 Q200 155 226 222 Z" fill="#1e293b" />
                {/* 꼭대기 깃발 */}
                <line x1="200" y1="45" x2="200" y2="20" stroke="white" strokeWidth="2.5" />
                <polygon points="200,20 224,28 200,36" fill={has('topFlag') ? '#10b981' : '#facc15'} stroke="#0f172a" strokeWidth="1.2" />
                {/* 장식 삼각 깃발 줄 */}
                <path d="M40 90 Q100 105 160 88" fill="none" stroke="white" strokeWidth="1.5" />
                {[60, 82, 102, 122, 142].map((bx, i) => (
                    <polygon
                        key={bx}
                        points={`${bx},94 ${bx + 12},95 ${bx + 6},108`}
                        fill={i === 1 && has('bunting') ? '#a855f7' : i % 2 === 0 ? '#facc15' : '#38bdf8'}
                    />
                ))}
                {/* 광대 캐릭터 (모자 방울, 나비넥타이, 오른쪽 신발, 저글링 공) */}
                <g>
                    <circle cx="120" cy="192" r="12" fill="#fff7ed" stroke="#0f172a" strokeWidth="1.5" />
                    <circle cx="120" cy="194" r="3" fill="#ef4444" />
                    <polygon points="108,184 120,164 132,184" fill="#6366f1" stroke="#0f172a" strokeWidth="1.5" />
                    {!has('clownPom') && <circle cx="120" cy="162" r="4.5" fill="#facc15" stroke="#0f172a" strokeWidth="1" />}
                    <rect x="108" y="204" width="24" height="36" rx="8" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.5" />
                    <polygon points="120,208 110,203 110,213" fill={has('bowTie') ? '#10b981' : '#ec4899'} />
                    <polygon points="120,208 130,203 130,213" fill={has('bowTie') ? '#10b981' : '#ec4899'} />
                    <rect x="111" y="240" width="7" height="22" fill="#2563eb" />
                    <rect x="122" y="240" width="7" height="22" fill="#2563eb" />
                    <ellipse cx="112" cy="265" rx="9" ry="5" fill="#ef4444" stroke="#0f172a" strokeWidth="1.2" />
                    <ellipse cx="130" cy="265" rx="9" ry="5" fill={has('clownShoe') ? '#22c55e' : '#ef4444'} stroke="#0f172a" strokeWidth="1.2" />
                    {/* 저글링 공 3개 */}
                    <circle cx="78" cy="164" r="7" fill={has('juggleBall') ? '#38bdf8' : '#f43f5e'} stroke="#0f172a" strokeWidth="1.2" />
                    <circle cx="94" cy="144" r="7" fill="#facc15" stroke="#0f172a" strokeWidth="1.2" />
                    <circle cx="110" cy="150" r="7" fill="#22c55e" stroke="#0f172a" strokeWidth="1.2" />
                </g>
                {/* 풍선 다발 & 티켓부스 */}
                <line x1="335" y1="200" x2="325" y2="120" stroke="white" strokeWidth="1.2" />
                <ellipse cx="312" cy="128" rx="13" ry="16" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.3" />
                {!has('balloonPink') && <ellipse cx="326" cy="116" rx="13" ry="16" fill="#f472b6" stroke="#0f172a" strokeWidth="1.3" />}
                <ellipse cx="344" cy="126" rx="13" ry="16" fill="#facc15" stroke="#0f172a" strokeWidth="1.3" />
                <rect x="284" y="196" width="52" height="54" fill="#fef3c7" stroke="#0f172a" strokeWidth="1.8" />
                <polygon points="278,196 310,174 342,196" fill="#ec4899" stroke="#0f172a" strokeWidth="1.8" />
                {!has('ticketStar') && <circle cx="310" cy="187" r="5" fill="#facc15" />}
            </svg>
        );
    }

    if (stageId === 'castle') {
        return (
            <svg viewBox="0 0 400 300" style={{ width: '100%', height: 'auto', display: 'block' }}>
                <rect width="400" height="300" fill="#a5f3fc" />
                {/* 구름 4개 중 cloud3 사라짐 */}
                <g fill="white" opacity="0.9">
                    {!has('cloud3') && <ellipse cx="78" cy="48" rx="28" ry="12" />}
                    <ellipse cx="160" cy="36" rx="22" ry="10" />
                    <ellipse cx="268" cy="44" rx="24" ry="10" />
                    <ellipse cx="348" cy="38" rx="24" ry="11" />
                </g>
                {/* 하늘 드래곤 (날개 한쪽 색만 변경!) */}
                <g transform="translate(322, 62)">
                    <ellipse cx="0" cy="6" rx="15" ry="8" fill="#10b981" stroke="#0f172a" strokeWidth="1.4" />
                    <polygon points="-4,2 -20,-16 -2,-4" fill="#059669" stroke="#0f172a" strokeWidth="1.2" />
                    <polygon points="4,2 20,-16 2,-4" fill={has('dragonWing') ? '#f43f5e' : '#059669'} stroke="#0f172a" strokeWidth="1.2" />
                    <circle cx="-11" cy="3" r="1.8" fill="#0f172a" />
                </g>
                {/* 초원 & 연못 */}
                <rect x="0" y="210" width="400" height="90" fill="#4ade80" />
                <ellipse cx="310" cy="252" rx="68" ry="26" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
                {/* 마법 성 */}
                <rect x="122" y="102" width="32" height="112" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
                <polygon points="116,102 138,62 160,102" fill="#8b5cf6" stroke="#334155" strokeWidth="2" />
                <polygon points="138,52 154,58 138,64" fill={has('flagLeft') ? '#facc15' : '#f43f5e'} />
                <rect x="246" y="102" width="32" height="112" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
                <polygon points="240,102 262,62 284,102" fill="#8b5cf6" stroke="#334155" strokeWidth="2" />
                <rect x="154" y="122" width="92" height="92" fill="#f1f5f9" stroke="#334155" strokeWidth="2" />
                <rect x="182" y="68" width="36" height="54" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
                <polygon points="176,68 200,32 224,68" fill="#ec4899" stroke="#334155" strokeWidth="2" />
                {!has('flagCenter') && <polygon points="200,20 218,26 200,32" fill="#facc15" />}
                {/* 탑 창문 */}
                <rect x="132" y="120" width="12" height="18" rx="6" fill="#fef08a" stroke="#334155" strokeWidth="1.4" />
                <rect x="256" y="120" width="12" height="18" rx="6" fill={has('towerWin') ? '#334155' : '#fef08a'} stroke="#334155" strokeWidth="1.4" />
                {/* 성문 & 문고리 */}
                <path d="M180 214 L180 172 Q200 155 220 172 L220 214 Z" fill="#92400e" stroke="#334155" strokeWidth="2" />
                <line x1="200" y1="163" x2="200" y2="214" stroke="#334155" strokeWidth="1.8" />
                <circle cx="192" cy="196" r="3" fill="#facc15" />
                {!has('doorRing') && <circle cx="208" cy="196" r="3" fill="#facc15" />}
                {/* 유니콘 (뿔 색만 변경!) */}
                <g transform="translate(86, 212)">
                    <ellipse cx="0" cy="12" rx="18" ry="11" fill="white" stroke="#334155" strokeWidth="1.5" />
                    <circle cx="15" cy="0" r="8" fill="white" stroke="#334155" strokeWidth="1.5" />
                    <polygon points="16,-6 24,-20 20,-4" fill={has('uniHorn') ? '#ef4444' : '#facc15'} stroke="#334155" strokeWidth="1" />
                </g>
                {/* 장미 4송이 중 rose2 사라짐 */}
                {[36, 58, 82, 108].map((rx, i) => {
                    if (i === 1 && has('rose2')) return null;
                    return <circle key={rx} cx={rx} cy="256" r="6" fill="#f43f5e" stroke="#881337" strokeWidth="1.4" />;
                })}
                {/* 연못 오리 2마리 중 duck2 사라짐 */}
                <g transform="translate(284, 248)">
                    <ellipse cx="0" cy="4" rx="10" ry="6" fill="#fde047" stroke="#334155" strokeWidth="1.2" />
                    <circle cx="-7" cy="-2" r="5" fill="#fde047" stroke="#334155" strokeWidth="1.2" />
                </g>
                {!has('duck2') && (
                    <g transform="translate(316, 250)">
                        <ellipse cx="0" cy="4" rx="8" ry="5" fill="#fde047" stroke="#334155" strokeWidth="1.2" />
                        <circle cx="-5" cy="-1" r="4" fill="#fde047" stroke="#334155" strokeWidth="1.2" />
                    </g>
                )}
                {/* 다리 난간 등불 */}
                <rect x="242" y="218" width="4" height="22" fill="#334155" />
                <circle cx="244" cy="216" r="6" fill={has('bridgeLamp') ? '#64748b' : '#fef08a'} stroke="#334155" strokeWidth="1.3" />
            </svg>
        );
    }

    // Stage 10: 화가의 비밀 아틀리에
    return (
        <svg viewBox="0 0 400 300" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <rect width="400" height="300" fill="#fef3c7" />
            <rect x="0" y="220" width="400" height="80" fill="#d97706" opacity="0.55" />
            {/* 왼쪽 창문 & 창밖 구름 3개 중 winCloud 사라짐 */}
            <rect x="26" y="34" width="102" height="106" fill="#7dd3fc" stroke="#78350f" strokeWidth="5" />
            <ellipse cx="52" cy="60" rx="14" ry="7" fill="white" />
            {!has('winCloud') && <ellipse cx="80" cy="60" rx="14" ry="7" fill="white" />}
            <ellipse cx="102" cy="84" rx="15" ry="7" fill="white" />
            <line x1="77" y1="34" x2="77" y2="140" stroke="#78350f" strokeWidth="3.5" />
            <line x1="26" y1="87" x2="128" y2="87" stroke="#78350f" strokeWidth="3.5" />
            {/* 오른쪽 벽 액자 (꽃 색 변경) */}
            <rect x="316" y="42" width="54" height="62" fill="#fffbeb" stroke="#78350f" strokeWidth="4" />
            <line x1="343" y1="92" x2="343" y2="70" stroke="#16a34a" strokeWidth="2.5" />
            <circle cx="343" cy="68" r="10" fill={has('frameTilt') ? '#3b82f6' : '#f43f5e'} />
            {/* 중앙 이젤 & 캔버스 그림 (태양 사라짐) */}
            <line x1="175" y1="190" x2="155" y2="262" stroke="#78350f" strokeWidth="5" />
            <line x1="225" y1="190" x2="245" y2="262" stroke="#78350f" strokeWidth="5" />
            <rect x="155" y="96" width="90" height="96" fill="white" stroke="#78350f" strokeWidth="4" />
            <rect x="160" y="101" width="80" height="54" fill="#bae6fd" />
            <rect x="160" y="155" width="80" height="32" fill="#86efac" />
            {!has('canvasSun') && <circle cx="214" cy="118" r="10" fill="#facc15" />}
            {/* 탁자 + 붓통 + 찻잔 */}
            <rect x="112" y="205" width="76" height="42" fill="#b45309" stroke="#451a03" strokeWidth="2" />
            <rect x="124" y="192" width="22" height="22" fill="#e2e8f0" stroke="#334155" strokeWidth="1.5" />
            <line x1="129" y1="192" x2="126" y2="176" stroke="#ef4444" strokeWidth="2.5" />
            {!has('brush') && <line x1="135" y1="192" x2="136" y2="174" stroke="#3b82f6" strokeWidth="2.5" />}
            <line x1="141" y1="192" x2="144" y2="177" stroke="#22c55e" strokeWidth="2.5" />
            {/* 찻잔 + 무늬 */}
            <rect x="158" y="210" width="20" height="16" rx="3" fill="white" stroke="#334155" strokeWidth="1.5" />
            {!has('mugDot') && <circle cx="168" cy="218" r="3.5" fill="#ec4899" />}
            {/* 화가 캐릭터 (베레모 모자, 앞치마 주머니, 왼쪽 신발, 팔레트 파란 물감) */}
            <g>
                <circle cx="296" cy="142" r="13" fill="#fed7aa" stroke="#0f172a" strokeWidth="1.6" />
                <ellipse cx="296" cy="127" rx="17" ry="8" fill={has('beret') ? '#10b981' : '#dc2626'} stroke="#0f172a" strokeWidth="1.5" />
                <rect x="280" y="156" width="32" height="58" rx="6" fill="#3b82f6" stroke="#0f172a" strokeWidth="1.6" />
                <rect x="285" y="168" width="22" height="44" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
                {!has('pocket') && <rect x="290" y="190" width="12" height="11" rx="2" fill="#fde047" stroke="#334155" strokeWidth="1" />}
                <rect x="285" y="214" width="8" height="46" fill="#1e293b" />
                <rect x="299" y="214" width="8" height="46" fill="#1e293b" />
                <ellipse cx="285" cy="263" rx="9" ry="5" fill={has('painterShoe') ? '#ec4899' : '#78350f'} stroke="#0f172a" strokeWidth="1.2" />
                <ellipse cx="305" cy="263" rx="9" ry="5" fill="#78350f" stroke="#0f172a" strokeWidth="1.2" />
                {/* 팔레트 & 물감 4색 중 파란 물감 사라짐 */}
                <ellipse cx="256" cy="176" rx="18" ry="12" fill="#fde68a" stroke="#78350f" strokeWidth="1.5" />
                <circle cx="247" cy="172" r="3" fill="#ef4444" />
                {!has('paletteBlue') && <circle cx="256" cy="170" r="3" fill="#3b82f6" />}
                <circle cx="264" cy="174" r="3" fill="#22c55e" />
                <circle cx="258" cy="182" r="3" fill="#a855f7" />
            </g>
            {/* 바닥 고양이 (목걸이 색 변경) */}
            <g transform="translate(82, 245)">
                <ellipse cx="0" cy="8" rx="18" ry="11" fill="#fb923c" stroke="#334155" strokeWidth="1.5" />
                <circle cx="14" cy="-2" r="9" fill="#fb923c" stroke="#334155" strokeWidth="1.5" />
                <line x1="6" y1="4" x2="18" y2="4" stroke={has('catCollar') ? '#22c55e' : '#ef4444'} strokeWidth="4" strokeLinecap="round" />
            </g>
        </svg>
    );
};

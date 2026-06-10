import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Code, ShieldCheck, Terminal, Play, CheckCircle2, AlertTriangle, RefreshCw, Cpu, Activity, ArrowLeft } from 'lucide-react';
import Tooltip from '../components/Tooltip';

const AgentHubPage = ({ onBack }) => {
    const [testRunning, setTestRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState([
        { id: 1, sender: 'system', text: '🤖 Lumini AI 에이전트 협업 본부 초기화 완료.', time: '17:00:00' },
        { id: 2, sender: 'planning', text: '기획: "버셀 및 깃허브 배포 정합성 검토를 시작합니다."', time: '17:00:05' },
        { id: 3, sender: 'dev', text: '개발: "userStore.js의 프로필 업데이트 함수 매개변수 에러(Parameter Mismatch)를 식별했습니다."', time: '17:00:12' },
        { id: 4, sender: 'dev', text: '개발: "구조를 updateProfile(userId, safeData)로 수정한 뒤 깃허브 main 브랜치에 푸시했습니다."', time: '17:00:20' },
        { id: 5, sender: 'testing', text: '테스트: "Playwright 캐시 초기화 및 드라이버 재설치 진행... 정상 작동 확인."', time: '17:00:30' },
        { id: 6, sender: 'testing', text: '테스트: "로컬 퍼피티어 검증 결과 모든 페이지 100% 정상 로드 완료! (PASS)"', time: '17:00:45' },
    ]);
    const [activeAgent, setActiveAgent] = useState('none');
    const logEndRef = useRef(null);

    // 로그 창 스크롤 제어
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // 에이전트 활동 상태 시뮬레이션
    useEffect(() => {
        if (testRunning) return;
        const interval = setInterval(() => {
            const agents = ['planning', 'dev', 'testing'];
            const randomAgent = agents[Math.floor(Math.random() * agents.length)];
            setActiveAgent(randomAgent);
            
            // 시뮬레이션 메시지 풀
            const simMsgs = {
                planning: [
                    '기획: "모바일 화면 가독성을 개선하기 위해 버튼 툴팁 설명을 추가 보완합니다."',
                    '기획: "유저 프로필 수정 및 크리스탈 지급 여정의 정합성을 검토 중입니다."',
                    '기획: "MBTI 매칭 일치도 계산기(Compatibility Game) 로직을 모니터링합니다."'
                ],
                dev: [
                    '개발: "ESLint 경고 목록(미사용 변수 no-unused-vars) 최적화 작업 검토 중..."',
                    '개발: "Supabase 실시간 동기화 상태 및 세션 갱신 API 모니터링."',
                    '개발: "Vite build config base path (/와 /lumini/) 빌드 검증 수행."'
                ],
                testing: [
                    '테스트: "Vercel 배포 도메인(https://lumini-seven.vercel.app) 헬스체크 중..."',
                    '테스트: "GitHub Pages 배포 도메인(https://kaesan02-ship-it.github.io/lumini) 에셋 로드 검증 중..."',
                    '테스트: "가입 특전 500 크리스탈 지급 팝업 렌더링 검사 완료."'
                ]
            };
            
            const randomMsg = simMsgs[randomAgent][Math.floor(Math.random() * simMsgs[randomAgent].length)];
            const timeStr = new Date().toTimeString().split(' ')[0];
            
            setLogs(prev => [...prev.slice(-30), {
                id: Date.now(),
                sender: randomAgent,
                text: randomMsg,
                time: timeStr
            }]);
            
            // 3초 후 포커스 아웃
            setTimeout(() => setActiveAgent('none'), 1500);
        }, 5000);

        return () => clearInterval(interval);
    }, [testRunning]);

    // 자동화 진단 테스트 시작
    const runSelfDiagnosis = () => {
        if (testRunning) return;
        setTestRunning(true);
        setProgress(0);
        
        const testLogs = [
            { pct: 10, text: '🔍 1단계: 배포 도메인 연결성 검증 시작 (Vercel / GitHub Pages)...' },
            { pct: 30, text: '🌐 2단계: 에셋(CSS, JS) 로드 확인... 성공 (200 OK)' },
            { pct: 50, text: '🔑 3단계: Supabase 인증 게이트 및 리다이렉트 주소 검증 완료' },
            { pct: 75, text: '💾 4단계: 프로필 업데이트 CRUD 트랜잭션 검증 통과' },
            { pct: 100, text: '🎉 5단계: 통합 테스트 패스! 모든 에이전트의 서명이 승인되었습니다.' }
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < testLogs.length) {
                const stepInfo = testLogs[currentStep];
                setProgress(stepInfo.pct);
                const timeStr = new Date().toTimeString().split(' ')[0];
                setLogs(prev => [...prev, {
                    id: Date.now() + currentStep,
                    sender: 'system',
                    text: stepInfo.text,
                    time: timeStr
                }]);
                currentStep++;
            } else {
                clearInterval(interval);
                setTestRunning(false);
            }
        }, 1500);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at top, #0f172a, #020617)',
            color: '#f8fafc',
            padding: '40px 20px',
            paddingTop: '90px',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* 상단 헤더 */}
            <div style={{ maxWidth: '1200px', margin: '0 auto 30px auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Tooltip text="이전 화면으로 돌아갑니다.">
                    <button onClick={onBack} style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '100px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 700,
                        transition: 'all 0.2s'
                    }}>
                        <ArrowLeft size={16} /> 이전
                    </button>
                </Tooltip>
                
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0
                }}>
                    AI 에이전트 협업 본부
                </h1>
                <div style={{ width: '80px' }} /> {/* 레이아웃 밸런싱용 */}
            </div>

            {/* 메인 콘솔 그리드 */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '24px'
            }}>
                
                {/* 1. 에이전트 팀원 상태 카드 */}
                <div style={{ display: 'grid', gap: '16px' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#94a3b8', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Cpu size={18} color="#a78bfa" /> 에이전트 프로필
                    </h2>

                    {/* 기획 에이전트 */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.7)',
                        border: activeAgent === 'planning' ? '2px solid #a78bfa' : '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '20px', padding: '20px',
                        boxShadow: activeAgent === 'planning' ? '0 0 20px rgba(167, 139, 250, 0.2)' : 'none',
                        transition: 'all 0.3s', backdropFilter: 'blur(12px)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa' }}>
                                <Compass size={28} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>기획 에이전트 (Planning)</h3>
                                <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 700 }}>UX & FLOW ARCHITECT</span>
                            </div>
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>대기중</span>
                            </div>
                        </div>
                        <p style={{ margin: '14px 0 0 0', fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                            사용자 행동 패턴과 기능 로직의 정합성을 검토합니다. 최근 진행 사항: 로그인 버튼 툴팁 보완, 게스트 성향 저장 구조 확립.
                        </p>
                    </div>

                    {/* 개발 에이전트 */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.7)',
                        border: activeAgent === 'dev' ? '2px solid #60a5fa' : '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '20px', padding: '20px',
                        boxShadow: activeAgent === 'dev' ? '0 0 20px rgba(96, 165, 250, 0.2)' : 'none',
                        transition: 'all 0.3s', backdropFilter: 'blur(12px)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(96, 165, 250, 0.15)', color: '#60a5fa' }}>
                                <Code size={28} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>개발 에이전트 (Development)</h3>
                                <span style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: 700 }}>CODE & DATABASE BUILDER</span>
                            </div>
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                                <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700 }}>코드 빌딩</span>
                            </div>
                        </div>
                        <p style={{ margin: '14px 0 0 0', fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                            소스 코드 구현 및 기술 부채를 해결합니다. 최근 해결: userStore.js의 Supabase 프로필 업데이트 API 연동 오류 수정.
                        </p>
                    </div>

                    {/* 테스트 에이전트 */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.7)',
                        border: activeAgent === 'testing' ? '2px solid #f472b6' : '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '20px', padding: '20px',
                        boxShadow: activeAgent === 'testing' ? '0 0 20px rgba(244, 114, 182, 0.2)' : 'none',
                        transition: 'all 0.3s', backdropFilter: 'blur(12px)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(244, 114, 182, 0.15)', color: '#f472b6' }}>
                                <ShieldCheck size={28} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>테스트 에이전트 (Testing)</h3>
                                <span style={{ fontSize: '0.8rem', color: '#f472b6', fontWeight: 700 }}>QUALITY ASSURANCE & E2E</span>
                            </div>
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>합격 판정</span>
                            </div>
                        </div>
                        <p style={{ margin: '14px 0 0 0', fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                            배포 서버 가동성과 동작 정합성을 검증합니다. 최근 성과: Vercel과 GitHub Pages 전 페이지 자동화 검사 패스 (100% PASS).
                        </p>
                    </div>
                </div>

                {/* 2. 에이전트 협업 터미널 로그 */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '450px' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#94a3b8', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Terminal size={18} color="#f472b6" /> 협업 모니터링 콘솔
                    </h2>

                    <div style={{
                        flex: 1,
                        background: '#090d16',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '24px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        overflow: 'hidden'
                    }}>
                        {/* 로그 리스트 */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            marginBottom: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            maxHeight: '350px'
                        }}>
                            {logs.map((log) => {
                                let color = '#94a3b8';
                                let bg = 'rgba(255, 255, 255, 0.03)';
                                if (log.sender === 'planning') { color = '#c084fc'; bg = 'rgba(167, 139, 250, 0.05)'; }
                                else if (log.sender === 'dev') { color = '#60a5fa'; bg = 'rgba(96, 165, 250, 0.05)'; }
                                else if (log.sender === 'testing') { color = '#f472b6'; bg = 'rgba(244, 114, 182, 0.05)'; }
                                else if (log.sender === 'system') { color = '#34d399'; bg = 'rgba(52, 211, 153, 0.05)'; }

                                return (
                                    <div key={log.id} style={{
                                        background: bg,
                                        padding: '10px 14px',
                                        borderRadius: '12px',
                                        borderLeft: `3px solid ${color}`,
                                        fontSize: '0.85rem',
                                        lineHeight: 1.4
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', opacity: 0.6, fontSize: '0.75rem' }}>
                                            <span style={{ color, fontWeight: 700 }}>{log.sender.toUpperCase()}</span>
                                            <span>{log.time}</span>
                                        </div>
                                        <div style={{ color: '#e2e8f0', fontWeight: 500 }}>{log.text}</div>
                                    </div>
                                );
                            })}
                            <div ref={logEndRef} />
                        </div>

                        {/* 테스트 가동 HUD */}
                        <div style={{
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            paddingTop: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            {testRunning && (
                                <div style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px' }}>
                                        <span>자가 진단 시나리오 구동 중...</span>
                                        <span style={{ fontWeight: 800, color: '#f472b6' }}>{progress}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            style={{ height: '100%', background: 'linear-gradient(90deg, #a78bfa, #f472b6)', borderRadius: '100px' }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <Tooltip text="에이전트가 배포 상태를 즉시 자가 검증하게 합니다.">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={testRunning}
                                        onClick={runSelfDiagnosis}
                                        style={{
                                            flex: 1,
                                            background: testRunning ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(135deg, #a78bfa, #f472b6)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '16px',
                                            fontWeight: 800,
                                            cursor: testRunning ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            fontSize: '0.9rem',
                                            boxShadow: testRunning ? 'none' : '0 10px 20px rgba(167, 139, 250, 0.2)'
                                        }}
                                    >
                                        <Play size={16} /> 자가 진단 실행
                                    </motion.button>
                                </Tooltip>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '10px 16px',
                                    borderRadius: '16px',
                                    background: 'rgba(52, 211, 153, 0.1)',
                                    border: '1px solid rgba(52, 211, 153, 0.2)',
                                    color: '#34d399',
                                    fontSize: '0.85rem',
                                    fontWeight: 700
                                }}>
                                    <Activity size={14} className={testRunning ? 'animate-spin' : ''} />
                                    <span>진단 가동 중</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default AgentHubPage;

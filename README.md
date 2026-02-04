# 🐝 Lumini: 성향 기반 소셜 매칭 플랫폼 (v7.0)

Lumini는 MBTI, OCEAN(Big Five), HEXACO 모델을 결합한 정밀 성격 진단과 위치 기반(LBS) 친구 매칭을 제공하는 소셜 서비스입니다.

## 🚀 주요 기능
- **정밀 성격 진단**: 24개의 엄선된 문항을 통한 다차원 성격 분석 (기술 지표 은닉형 UI)
- **분석 리포트**: 레이더 차트를 활용한 시각적 성향 리포트 및 MBTI 유형 매칭
- **주변 탐색 대시보드**: 내 주변에 있는 성격 유사도가 높은 친구들을 지도 마커로 확인
- **하이브(Hive) 시뮬레이션**: 관심사 및 성향이 맞는 그룹 채팅룸 시스템
- **데이터 영속성**: 브라우저 로컬 스토리지 연동으로 새로고침 시에도 진단 결과 유지

## 📂 프로젝트 구조 (모듈형 아키텍처)
```text
src/
 ├── pages/            # 주요 화면 컴포넌트 (Landing, Test, Result, Dashboard, Hive)
 ├── components/       # 공통 UI 부품 (RadarChart, MapContainer, Modals)
 ├── App.jsx           # 메인 라우팅 및 전역 상태 관리 로직
 └── index.css         # 라이트 테마 기반 디자인 시스템 정의
```

## 🛠️ 개발 가이드 및 실행 방법
1. **의존성 설치**: `npm install`
2. **로컬 실행**: `npm run dev`
3. **데이터 초기화**: 우측 상단 '설정(톱니바퀴) > 진단 데이터 초기화' 클릭

## 💾 프로젝트 히스토리 관리법
- 이 프로젝트의 상세 작업 일지와 설계도는 `.gemini/antigravity/brain/` 폴더 내의 `task.md`, `walkthrough.md`에 기록되어 있습니다. 
- 지속적인 업데이트를 위해 **Git** 사용을 강력히 권장합니다.

---
**Created with Antigravity AI**

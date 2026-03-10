import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 루미 크리스탈 (Lumi Crystal) 가상 재화 시스템
 * 💎 획득: 출석, 챌린지, 대화, 광고 시청
 * 💎 사용: AI 인사이트 잠금 해제, 슈퍼 좋아요, 프리미엄 스킨
 */
const useCrystalStore = create(
    persist(
        (set, get) => ({
            crystals: 500, // 신규 유저 환영 보너스 (가입 혜택)
            isPremium: false,
            premiumExpiresAt: null,
            inventory: {}, // { 'super-like': 2, 'boost': 1 }
            activeBoostUntil: null, // 부스트 만료 시간
            dailyCheckin: null, // 마지막 출석 체크 날짜
            totalEarned: 500,
            totalSpent: 0,

            // 크리스탈 획득
            earnCrystals: (amount, reason = '') => {
                set(state => ({
                    crystals: state.crystals + amount,
                    totalEarned: state.totalEarned + amount,
                }));
                return amount;
            },

            // 크리스탈 소비 (잔액 부족 시 false 반환)
            spendCrystals: (amount) => {
                const { crystals } = get();
                if (crystals < amount) return false;
                set(state => ({
                    crystals: state.crystals - amount,
                    totalSpent: state.totalSpent + amount,
                }));
                return true;
            },

            // 타 유저에게 크리스탈 선물 (로컬 시뮬레이션: 내 크리스탈 차감 판정 유지)
            giftCrystals: (amount) => {
                const { spendCrystals } = get();
                if (spendCrystals(amount)) {
                    return true;
                }
                return false;
            },

            // 아이템 구매 (price는 총 가격, quantity는 구매 수량)
            buyItem: (itemId, price, quantity = 1) => {
                const { spendCrystals } = get();
                if (spendCrystals(price)) {
                    set(state => ({
                        inventory: {
                            ...state.inventory,
                            [itemId]: (state.inventory[itemId] || 0) + quantity
                        }
                    }));
                    return true;
                }
                return false;
            },

            // 아이템 사용
            useItem: (itemId) => {
                const { inventory } = get();
                if (!inventory[itemId] || inventory[itemId] <= 0) return false;

                set(state => {
                    const newInventory = { ...state.inventory };
                    newInventory[itemId] -= 1;

                    let newBoost = state.activeBoostUntil;
                    if (itemId === 'boost') {
                        const now = new Date();
                        const duration = 24 * 60 * 60 * 1000; // 24시간
                        newBoost = new Date(now.getTime() + duration).toISOString();
                    }

                    return {
                        inventory: newInventory,
                        activeBoostUntil: newBoost
                    };
                });
                return true;
            },

            // 부스트 상태 확인
            isBoostActive: () => {
                const { activeBoostUntil } = get();
                if (!activeBoostUntil) return false;
                return new Date() < new Date(activeBoostUntil);
            },

            // 충전 (결제 시뮬레이션)
            chargeCrystals: (amount) => {
                set(state => ({
                    crystals: state.crystals + amount,
                    totalEarned: state.totalEarned + amount,
                }));
            },

            // 일일 출석 체크 (하루 한 번, +30💎)
            dailyCheckinBonus: () => {
                const today = new Date().toDateString();
                const { dailyCheckin } = get();
                if (dailyCheckin === today) return 0; // 이미 받음

                const bonus = 30;
                set(state => ({
                    crystals: state.crystals + bonus,
                    totalEarned: state.totalEarned + bonus,
                    dailyCheckin: today,
                }));
                return bonus;
            },

            // 프리미엄 활성화
            activatePremium: (days = 30) => {
                const expires = new Date();
                expires.setDate(expires.getDate() + days);
                set({ isPremium: true, premiumExpiresAt: expires.toISOString() });
            },

            // 프리미엄 상태 확인 (만료 자동 처리)
            checkPremium: () => {
                const { isPremium, premiumExpiresAt } = get();
                if (isPremium && premiumExpiresAt) {
                    if (new Date() > new Date(premiumExpiresAt)) {
                        set({ isPremium: false, premiumExpiresAt: null });
                        return false;
                    }
                }
                return isPremium;
            },
        }),
        {
            name: 'lumini-crystal-storage',
        }
    )
);

export default useCrystalStore;

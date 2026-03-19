import React, { useState } from 'react';
import useUserStore from '../store/userStore';
import '../styles/Dashboard.css';

// Hooks
import { useDashboardData } from '../hooks/useDashboardData';

// Components
import LumiWelcomeSection from '../components/dashboard/LumiWelcomeSection';
import QuickActionsGrid from '../components/dashboard/QuickActionsGrid';
import SoulReportCard from '../components/dashboard/SoulReportCard';
import DeepSoulBanner from '../components/dashboard/DeepSoulBanner';
import NearbyUsersSection from '../components/dashboard/NearbyUsersSection';
import SidebarWidgets from '../components/dashboard/SidebarWidgets';
import UserDetailModal from '../components/UserDetailModal';

// Lucide Icons for tabs
import { Users, MapPin, Sparkles } from 'lucide-react';

const DashboardPage = ({ onNavigate, nearbyUsers, onSelectUser }) => {
    const { userData, profile, userName } = useUserStore();

    const {
        activeTab,
        setActiveTab,
        myDistrict,
        completedChallenges,
        streak,
        hasDeepSoul,
        neighborUsers,
        displayedUsers
    } = useDashboardData(userData, nearbyUsers, profile);

    const categories = [
        { id: 'all', name: '전체 추천', icon: <Sparkles size={16} /> },
        { id: 'friend', name: '우리 동네', icon: <MapPin size={16} /> },
        { id: 'online', name: '접속 중', icon: <Users size={16} /> },
    ];

    if (!profile) return null;

    return (
        <div className="page-container" style={{ paddingBottom: '100px' }}>
            <div className="dashboard-grid">
                {/* 왼쪽 메인 컬렉션 */}
                <div className="left-panel">
                    <LumiWelcomeSection userName={profile?.name} userData={userData} />
                    
                    <QuickActionsGrid 
                        onNavigate={onNavigate} 
                        completedChallenges={completedChallenges} 
                        streak={streak} 
                    />

                    <SoulReportCard 
                        userData={userData} 
                        mbtiType={profile?.mbti} 
                        isBoosted={profile?.isBoosted} 
                    />

                    <DeepSoulBanner 
                        hasDeepSoul={hasDeepSoul} 
                        onNavigate={onNavigate} 
                    />

                    <NearbyUsersSection 
                        displayedUsers={displayedUsers}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        categories={categories}
                        neighborUsers={neighborUsers}
                        myDistrict={myDistrict}
                        onSelectUser={setSelectedUser}
                        onNavigate={onNavigate}
                    />
                </div>

                {/* 오른쪽 사이드바/위젯 */}
                <SidebarWidgets 
                    hasDeepSoul={hasDeepSoul} 
                    nearbyUsers={nearbyUsers}
                    onSelectUser={setSelectedUser}
                    onNavigate={onNavigate}
                />
            </div>

            {/* 유저 상세 모달 */}
            <UserDetailModal 
                user={selectedUser} 
                onClose={() => setSelectedUser(null)} 
            />
        </div>
    );
};

export default DashboardPage;

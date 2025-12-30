
import React, { useState } from 'react';
import { UserRole, User } from './types';
import { NAVIGATION_ITEMS } from './constants';
import { 
  Bell, LogOut, Menu, X, Baby, Search, User as UserIcon, Settings as SettingsIcon,
  Sparkles, Heart
} from 'lucide-react';

// Subviews
import Dashboard from './views/Principal/Dashboard';
import StaffManagement from './views/Principal/StaffManagement';
import StudentManagement from './views/Principal/StudentManagement';
import ClassManagement from './views/Principal/ClassManagement';
import AuditManagement from './views/Principal/AuditManagement';
import SystemSettings from './views/Principal/SystemSettings';
import DailyManagement from './views/Teacher/DailyManagement';
import { Button, Card } from './components/Common';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showLogin, setShowLogin] = useState(true);

  const login = (role: UserRole) => {
    const mockUser: User = {
      id: '1',
      name: role === UserRole.PRINCIPAL ? '刘园长' : role === UserRole.ACADEMIC ? '陈主任' : '林老师',
      role: role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`,
      className: role === UserRole.TEACHER ? '小一班' : undefined
    };
    setUser(mockUser);
    setShowLogin(false);
    setActiveTab(NAVIGATION_ITEMS[role][0].path);
  };

  const handleLogout = () => {
    setUser(null);
    setShowLogin(true);
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-4 ring-8 ring-pink-50">
              <Baby size={48} className="text-pink-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">沅陵县太安幼儿园</h1>
            <p className="text-gray-500 mt-2 font-medium">教务管理一体化平台</p>
          </div>

          <Card className="p-8 space-y-4 border-2 border-pink-100">
            <h2 className="text-lg font-bold text-gray-700 mb-4">请选择角色进入演示系统</h2>
            <div className="grid grid-cols-1 gap-3">
              <Button onClick={() => login(UserRole.PRINCIPAL)} className="justify-start gap-3">
                <SettingsIcon size={20} /> 园长管理入口
              </Button>
              <Button onClick={() => login(UserRole.ACADEMIC)} variant="secondary" className="justify-start gap-3">
                <Search size={20} /> 教务统筹入口
              </Button>
              <Button onClick={() => login(UserRole.TEACHER)} variant="ghost" className="justify-start gap-3 border-2 border-pink-50 hover:bg-pink-50">
                <UserIcon size={20} className="text-pink-400" /> 班级老师入口
              </Button>
              <Button onClick={() => login(UserRole.PARENT)} variant="ghost" className="justify-start gap-3 border-2 border-blue-50 hover:bg-blue-50">
                <Heart size={20} className="text-blue-400" /> 家长查询入口
              </Button>
            </div>
          </Card>
          
          <p className="text-[10px] text-gray-300 mt-8 tracking-widest uppercase font-bold">© 2023 Taian Kindergarten | Management System V2.5</p>
        </div>
      </div>
    );
  }

  const roleNavItems = user ? NAVIGATION_ITEMS[user.role] : [];

  const renderContent = () => {
    if (user?.role === UserRole.PRINCIPAL) {
      switch (activeTab) {
        case 'dashboard': return <Dashboard />;
        case 'staff': return <StaffManagement />;
        case 'students': return <StudentManagement />;
        case 'classes': return <ClassManagement />;
        case 'audit': return <AuditManagement />;
        case 'settings': return <SystemSettings />;
        default: break;
      }
    }
    if (user?.role === UserRole.TEACHER && activeTab === 'daily') return <DailyManagement />;
    
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
          <Baby size={64} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">模块预览中</h3>
          <p className="text-gray-400 mt-1">此功能模块正在适配最新教务标准，敬请期待！</p>
          <Button variant="ghost" className="mt-4" onClick={() => setActiveTab(roleNavItems[0].path)}>返回首页</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
              <Baby size={24} className="text-pink-400" />
            </div>
            <div>
              <h2 className="font-black text-gray-800 leading-tight">太安教务</h2>
              <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Control Center</span>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2">
            {roleNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  setActiveTab(item.path);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group
                  ${activeTab === item.path 
                    ? 'bg-[#FFB7C5] text-white shadow-lg shadow-pink-100' 
                    : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <span className={`${activeTab === item.path ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                  {item.icon}
                </span>
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto p-4 bg-pink-50 rounded-3xl flex items-center gap-3 border border-pink-100">
             <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                <Sparkles size={18} className="text-pink-400 animate-pulse" />
             </div>
             <div className="text-[10px] text-pink-600 font-bold leading-tight">
               教务助手在线：<br/>数据同步已就绪
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-gray-50 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl">
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl font-black text-gray-800 lg:block hidden">
              {roleNavItems.find(i => i.path === activeTab)?.label || '管理控制台'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer hidden md:block">
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white border-2 border-white font-bold">3</div>
              <Bell className="text-gray-400 group-hover:text-pink-400 transition-colors" size={20} />
            </div>
            
            <div className="h-8 w-px bg-gray-100 mx-1 hidden md:block" />

            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-gray-800 leading-none">{user?.name}</p>
                <p className="text-[10px] text-gray-400 mt-1.5 font-bold uppercase tracking-wider">
                  {user?.role === UserRole.PRINCIPAL ? '园长权限' : user?.role === UserRole.ACADEMIC ? '教务主管' : user?.className + ' 教师'}
                </p>
              </div>
              <img src={user?.avatar} alt="Avatar" className="w-10 h-10 rounded-2xl border-2 border-pink-50 bg-gray-50" />
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-all"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth bg-[#FFFDF9]">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

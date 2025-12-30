
import React, { useState } from 'react';
import { Card, Button, Modal, Progress, Badge } from '../../components/Common';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { Users, School, GraduationCap, TrendingUp, Download, CheckCircle2 } from 'lucide-react';
import { MOCK_STUDENTS } from '../../constants';

const CHART_COLORS = ['#FFB7C5', '#87CEEB', '#98FB98', '#FFD700', '#DDA0DD'];

const Dashboard: React.FC = () => {
  const [exportProgress, setExportProgress] = useState(-1);
  const [detailModal, setDetailModal] = useState<{ open: boolean, title: string, data: any[] }>({ 
    open: false, title: '', data: [] 
  });
  const [timeRange, setTimeRange] = useState('week');

  const stats = [
    { label: '在园幼儿', value: '256', icon: <GraduationCap className="text-pink-400" />, trend: '+5%' },
    { label: '活跃班级', value: '12', icon: <School className="text-blue-400" />, trend: '0' },
    { label: '教职工', value: '32', icon: <Users className="text-green-400" />, trend: '+2' },
    { label: '今日出勤', value: '96.5%', icon: <TrendingUp className="text-yellow-400" />, trend: '+1.2%' },
  ];

  const attendanceData = [
    { name: '周一', rate: 94 },
    { name: '周二', rate: 96 },
    { name: '周三', rate: 98 },
    { name: '周四', rate: 95 },
    { name: '周五', rate: 92 },
  ];

  const gradeDistribution = [
    { name: '小班', value: 80 },
    { name: '中班', value: 96 },
    { name: '大班', value: 80 },
  ];

  const handleChartClick = (name: string) => {
    // 模拟点击图表区域联动查看明细
    const filtered = MOCK_STUDENTS.filter(s => s.className.includes(name.substring(0, 1)));
    setDetailModal({
      open: true,
      title: `${name}幼儿明细`,
      data: filtered.length > 0 ? filtered : MOCK_STUDENTS.slice(0, 5)
    });
  };

  const handleExport = () => {
    setExportProgress(0);
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">沅陵县太安幼儿园 · 教务看板</h2>
          <p className="text-sm text-gray-400">实时数据监控与决策支持</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-pink-100"
          >
            <option value="today">今日</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
          </select>
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download size={16} className="mr-2" /> 导出数据报表
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group">
            <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-pink-50 transition-colors">
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">{stat.label}</p>
              <h4 className="text-2xl font-black text-gray-800 leading-none my-1">{stat.value}</h4>
              <span className={`text-[10px] font-bold ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-gray-400'}`}>
                {stat.trend} {stat.trend.startsWith('+') ? '↑' : ''}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">全园出勤走势图</h3>
            <Badge color="pink">实时更新</Badge>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} />
                <YAxis axisLine={false} tickLine={false} domain={[80, 100]} tick={{fontSize: 12, fill: '#999'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#FFB7C5" 
                  strokeWidth={5} 
                  dot={{ r: 6, fill: '#FFB7C5', strokeWidth: 3, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-gray-800 mb-6">幼儿分布比例</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  onClick={(data) => handleChartClick(data.name)}
                  className="cursor-pointer outline-none"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {gradeDistribution.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                    <span className="text-gray-500">{d.name}</span>
                  </div>
                  <span className="font-bold text-gray-700">{d.value}人</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Modal 
        isOpen={detailModal.open} 
        onClose={() => setDetailModal({ ...detailModal, open: false })}
        title={detailModal.title}
        size="lg"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-400 text-left uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3">姓名</th>
                <th className="px-4 py-3">性别</th>
                <th className="px-4 py-3">班级</th>
                <th className="px-4 py-3">家长</th>
                <th className="px-4 py-3">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {detailModal.data.map((s, idx) => (
                <tr key={idx} className="hover:bg-pink-50/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-gray-700">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.gender === 'male' ? '男' : '女'}</td>
                  <td className="px-4 py-3 text-gray-500">{s.className}</td>
                  <td className="px-4 py-3 text-gray-500">{s.parentName}</td>
                  <td className="px-4 py-3">
                    <Badge color="green">在园</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      <Modal 
        isOpen={exportProgress >= 0} 
        onClose={() => setExportProgress(-1)}
        title="数据导出中"
      >
        <div className="space-y-6 py-4">
          <Progress value={exportProgress} label="正在生成 Excel 报表..." />
          {exportProgress === 100 && (
            <div className="flex flex-col items-center gap-4 p-4 bg-green-50 rounded-2xl animate-in fade-in zoom-in duration-300">
              <CheckCircle2 size={48} className="text-green-500" />
              <div className="text-center">
                <p className="font-bold text-green-800">报表导出成功！</p>
                <p className="text-xs text-green-600">文件名：2023_太安幼儿园_教务统计.xlsx</p>
              </div>
              <div className="flex gap-2 w-full">
                <Button className="flex-1" size="sm" variant="secondary">打开文件</Button>
                <Button className="flex-1" size="sm" variant="outline">查看保存路径</Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;

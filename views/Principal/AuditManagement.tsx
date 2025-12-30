
import React, { useState } from 'react';
import { Card, Button, Badge, Modal, Input } from '../../components/Common';
import { CheckCircle2, XCircle, Clock, FileText, MessageSquare } from 'lucide-react';

const AuditManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedAudit, setSelectedAudit] = useState<any>(null);

  const audits = [
    { id: '1', title: '小一班教学周计划', submitter: '林老师', date: '2023-10-27 09:30', status: 'pending', content: '教学目标：感知秋天色彩；活动安排：落叶粘贴画...' },
    { id: '2', title: '大二班秋游活动方案', submitter: '王老师', date: '2023-10-26 15:20', status: 'pending', content: '地点：县城滨江公园；内容：户外写生、亲子野餐...' },
    { id: '3', title: '全园消防演习物料申请', submitter: '陈主任', date: '2023-10-27 11:00', status: 'pending', content: '申请物资：迷你灭火器5个、逃生毛巾32条...' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">教务审核中心</h2>
        <p className="text-sm text-gray-400">集中审核全园教学计划、活动方案及各项申请</p>
      </div>

      <div className="flex gap-4 border-b border-gray-100 pb-px">
        {[
          { id: 'pending', label: '待处理', color: 'red', count: 3 },
          { id: 'approved', label: '已通过', color: 'green', count: 12 },
          { id: 'rejected', label: '已驳回', color: 'gray', count: 2 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2
              ${activeTab === tab.id ? 'text-pink-400 border-pink-400' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] text-white ${tab.color === 'red' ? 'bg-red-400' : 'bg-gray-300'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {audits.map(item => (
          <Card key={item.id} className="hover:shadow-md transition-all group p-5">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-pink-50 group-hover:text-pink-400 transition-colors">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 group-hover:text-pink-500 transition-colors">{item.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock size={12} /> {item.date}</span>
                    <span className="w-1 h-1 bg-gray-200 rounded-full" />
                    <span>提交人：{item.submitter}</span>
                  </div>
                </div>
              </div>
              <Button size="sm" onClick={() => setSelectedAudit(item)}>去审批</Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal 
        isOpen={!!selectedAudit} 
        onClose={() => setSelectedAudit(null)} 
        title="审批详情"
        size="lg"
        footer={
          <div className="flex justify-between w-full">
            <Button variant="ghost" onClick={() => setSelectedAudit(null)}>暂时搁置</Button>
            <div className="flex gap-2">
              <Button variant="outline" className="text-red-400 border-red-100 hover:bg-red-50">
                驳回申请
              </Button>
              <Button onClick={() => setSelectedAudit(null)}>审核通过</Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">申请详情</p>
            <p className="text-sm text-gray-700 leading-relaxed">{selectedAudit?.content}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600 ml-1">
              <MessageSquare size={14} className="text-pink-300" />
              审批意见 (可选)
            </div>
            <textarea 
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-pink-200 text-sm h-24 transition-all"
              placeholder="请输入通过理由或驳回修改建议..."
            ></textarea>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-400 shadow-sm">
              <CheckCircle2 size={16} />
            </div>
            <p className="text-[10px] text-blue-700">操作后将通过站内信实时通知 <span className="font-bold">{selectedAudit?.submitter}</span>。</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AuditManagement;

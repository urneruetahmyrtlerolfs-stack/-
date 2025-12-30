
import React, { useState } from 'react';
import { Card, Button, Input, Modal, Progress, Badge } from '../../components/Common';
import { Settings, Shield, Database, Save, Copy, MessageCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

const SystemSettings: React.FC = () => {
  const [backupProgress, setBackupProgress] = useState(-1);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState(0); // 0: select, 1: result
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);

  const handleBackup = () => {
    setBackupProgress(0);
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">系统设置</h2>
        <p className="text-sm text-gray-400">配置园所全局参数及数据安全管理</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="text-pink-400" />
            <h3 className="font-bold text-gray-800">基础参数配置</h3>
          </div>
          <div className="space-y-4">
            <Input 
              label="幼儿园全称" 
              defaultValue="沅陵县太安幼儿园" 
              onBlur={() => {}} // 失去焦点自动保存逻辑
              hint="将显示在所有报表页眉中"
            />
            <Input 
              label="入园开始时间" 
              defaultValue="07:30" 
              type="time"
            />
            <Input 
              label="离园结束时间" 
              defaultValue="17:00" 
              type="time"
            />
            <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                <span className="text-xs font-medium text-gray-600">修改已自动同步至全园端</span>
              </div>
              <Button size="sm" variant="ghost">历史记录</Button>
            </div>
          </div>
        </Card>

        <Card className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-blue-400" />
            <h3 className="font-bold text-gray-800">账户安全管理</h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 border border-gray-100 rounded-2xl flex justify-between items-center group">
              <div>
                <h4 className="text-sm font-bold text-gray-700">教职工密码重置</h4>
                <p className="text-[10px] text-gray-400">为忘记密码的教职工生成临时登录密码</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setIsResetModalOpen(true)}>立即重置</Button>
            </div>
            <div className="p-4 border border-gray-100 rounded-2xl flex justify-between items-center group">
              <div>
                <h4 className="text-sm font-bold text-gray-700">系统登录日志</h4>
                <p className="text-[10px] text-gray-400">查看最近 30 天的账户登录情况</p>
              </div>
              <Button size="sm" variant="ghost">查看日志</Button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Database className="text-green-400" />
          <h3 className="font-bold text-gray-800">数据备份与恢复</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 border-2 border-dashed border-gray-100 rounded-3xl space-y-4">
            <h4 className="font-bold text-gray-700 text-sm">全量数据快照备份</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              包含幼儿档案、教职工信息、财务记录等所有核心数据。建议每周至少手动备份一次。
            </p>
            <Button className="w-full" variant="secondary" onClick={handleBackup}>
              <Database size={16} className="mr-2" /> 立即生成备份
            </Button>
            {backupProgress >= 0 && <Progress value={backupProgress} label="正在构建数据快照包..." />}
          </div>
          <div className="p-5 border-2 border-dashed border-red-50 rounded-3xl space-y-4">
            <h4 className="font-bold text-red-700 text-sm">历史数据还原</h4>
            <p className="text-xs text-red-400/70 leading-relaxed">
              使用之前生成的备份文件恢复系统状态。注意：此操作具有高风险，将覆盖当前所有数据。
            </p>
            <Button className="w-full" variant="danger" onClick={() => setIsRestoreConfirmOpen(true)}>
              <Shield size={16} className="mr-2" /> 恢复历史备份
            </Button>
          </div>
        </div>
      </Card>

      {/* 密码重置弹窗 */}
      <Modal 
        isOpen={isResetModalOpen} 
        onClose={() => {setIsResetModalOpen(false); setResetStep(0);}} 
        title="密码重置助手"
      >
        {resetStep === 0 ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 ml-1">选择人员</label>
              <select className="w-full px-4 py-2.5 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:border-pink-200 text-sm">
                <option value="">请搜索或选择教职工</option>
                <option value="1">林老师 (13388889999)</option>
                <option value="2">陈主任 (13144445555)</option>
              </select>
            </div>
            <Button className="w-full" onClick={() => setResetStep(1)}>生成临时密码</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-3xl text-center space-y-2">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">临时密码</p>
              <p className="text-4xl font-black text-gray-800 tracking-tighter">TA-668822</p>
              <p className="text-[10px] text-pink-400">有效时长：24 小时</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Copy size={16} /> 复制密码
              </Button>
              <Button variant="secondary" size="sm" className="gap-2">
                <MessageCircle size={16} /> 短信发送
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 还原强制确认 */}
      <Modal 
        isOpen={isRestoreConfirmOpen} 
        onClose={() => setIsRestoreConfirmOpen(false)} 
        title="高风险操作警告"
      >
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500 animate-pulse">
              <AlertTriangle size={40} />
            </div>
            <div>
              <h4 className="text-xl font-black text-red-600">确认要执行还原吗？</h4>
              <p className="text-sm text-gray-500 mt-2 px-6">
                系统将使用 2023-10-25 的备份覆盖现有数据。当前所有新增信息将<span className="font-bold underline">永久丢失</span>。
              </p>
            </div>
          </div>
          <div className="space-y-3">
             <Input label="请输入 'CONFIRM' 确认执行" placeholder="CONFIRM" />
             <Button className="w-full" variant="danger" size="lg" onClick={() => setIsRestoreConfirmOpen(false)}>
               确认覆盖并还原
             </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SystemSettings;

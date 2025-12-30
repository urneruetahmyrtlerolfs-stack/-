
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Modal, Badge } from '../../components/Common';
import { School, User, Users, ChevronDown, ChevronUp, GripVertical, Plus, Save } from 'lucide-react';
import { MOCK_STAFF } from '../../constants';

const STORAGE_KEY = 'taian_class_config';

const ClassManagement: React.FC = () => {
  const [classes, setClasses] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [
      { id: '1', name: '小1班', lead: '林老师', assistant: '王老师', nurse: '赵阿姨', count: 25 },
      { id: '2', name: '中2班', lead: '陈老师', assistant: '李老师', nurse: '孙阿姨', count: 28 },
      { id: '3', name: '大3班', lead: '张老师', assistant: '刘老师', nurse: '钱阿姨', count: 30 },
    ];
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
  }, [classes]);

  const isDuplicate = classes.some((c: any) => c.name === newClassName);

  const handleCreateClass = async () => {
    if (!newClassName || isDuplicate) return;
    
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const newCls = {
      id: 'cls_' + Date.now(),
      name: newClassName,
      lead: '待指派',
      assistant: '待指派',
      nurse: '待指派',
      count: 0
    };
    
    setClasses((prev: any) => [...prev, newCls]);
    setIsSaving(false);
    setNewClassName('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">班级管理</h2>
          <p className="text-sm text-gray-400">班级配置已自动储存，重启浏览器也不会丢失</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} className="mr-2" /> 创建新班级
        </Button>
      </div>

      <div className="space-y-3">
        {classes.map((cls: any) => (
          <div key={cls.id} className="group">
            <Card className={`p-0 overflow-hidden border-2 transition-all ${expandedClass === cls.id ? 'border-pink-100 shadow-lg' : 'border-transparent'}`}>
              <div className="flex items-center px-6 py-4 cursor-pointer" onClick={() => setExpandedClass(expandedClass === cls.id ? null : cls.id)}>
                <div className="p-2 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing">
                  <GripVertical size={20} />
                </div>
                <div className="flex-1 flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                    <School size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-800">{cls.name}</h4>
                    <p className="text-[10px] text-gray-400">班级人数: {cls.count} 人</p>
                  </div>
                </div>
                <div className="flex gap-10 mr-10 hidden md:flex">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">班主任</p>
                    <p className="text-sm font-bold text-gray-700">{cls.lead}</p>
                  </div>
                </div>
                {expandedClass === cls.id ? <ChevronUp className="text-pink-400" /> : <ChevronDown className="text-gray-300" />}
              </div>
              
              {expandedClass === cls.id && (
                <div className="px-6 py-6 border-t border-gray-50 bg-[#FFFDF9] animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h5 className="text-xs font-black text-gray-400 uppercase flex items-center gap-2">
                        <Users size={14} /> 核心教资
                      </h5>
                      <div className="space-y-2">
                        {['lead', 'assistant', 'nurse'].map((roleKey) => (
                          <div key={roleKey} className="p-3 bg-white rounded-xl border border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-gray-500">{roleKey === 'lead' ? '班主任' : roleKey === 'assistant' ? '配班' : '保育员'}</span>
                            <span className="text-xs font-bold text-gray-700">{(cls as any)[roleKey]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <h5 className="text-xs font-black text-gray-400 uppercase flex items-center gap-2">
                        <User size={14} /> 快速管理
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        <Badge color="pink">档案同步中</Badge>
                        <Badge color="blue">出勤已锁定</Badge>
                      </div>
                      <div className="pt-4 flex gap-2">
                        <Button size="sm" variant="secondary">修改教资配比</Button>
                        <Button size="sm" variant="outline" className="text-red-400 border-red-50" onClick={() => {
                          setClasses((prev: any) => prev.filter((c: any) => c.id !== cls.id));
                        }}>解散班级</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="初始化新班级"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} disabled={isSaving}>取消</Button>
            <Button disabled={isDuplicate || !newClassName} onClick={handleCreateClass} loading={isSaving}>
              <Save size={16} className="mr-2" /> 确认并持久化保存
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label="班级名称" 
            placeholder="如：中1班" 
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            error={isDuplicate ? '该班级名称已存在' : ''}
          />
          <div className="p-4 bg-pink-50 rounded-2xl flex gap-3">
            <Users size={18} className="text-pink-400 shrink-0" />
            <p className="text-[10px] text-pink-700 font-bold">保存后，此班级将立即出现在幼儿档案管理的分页中，方便进行人员分配。</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClassManagement;

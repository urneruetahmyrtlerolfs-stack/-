
import React, { useState, useMemo, useEffect } from 'react';
import { Card, Button, Input, Modal, Badge } from '../../components/Common';
import { MOCK_STAFF as INITIAL_STAFF } from '../../constants';
import { Search, UserPlus, Trash2, Edit3, ShieldAlert, Save } from 'lucide-react';
import { StaffPosition, UserRole } from '../../types';

const STORAGE_KEY = 'taian_staff_data';

const StaffManagement: React.FC = () => {
  // 从本地存储初始化数据，如果没有则使用模拟数据
  const [staffList, setStaffList] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: '', phone: '', position: StaffPosition.LEAD_TEACHER });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 监听数据变化并同步到本地存储
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(staffList));
  }, [staffList]);

  const validate = (field: string, value: string) => {
    let err = '';
    if (field === 'name' && !value) err = '请输入姓名';
    if (field === 'phone' && !/^1[3-9]\d{9}$/.test(value)) err = '手机号格式不正确';
    setErrors(prev => ({ ...prev, [field]: err }));
    return !err;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  const handleEdit = (staff: any) => {
    setModalMode('edit');
    setEditingId(staff.id);
    setFormData({
      name: staff.name,
      phone: staff.phone,
      position: (staff.className ? StaffPosition.LEAD_TEACHER : StaffPosition.OFFICE) as StaffPosition
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setModalMode('add');
    setEditingId(null);
    setFormData({ name: '', phone: '', position: StaffPosition.LEAD_TEACHER });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const isNameValid = validate('name', formData.name);
    const isPhoneValid = validate('phone', formData.phone);
    if (!isNameValid || !isPhoneValid) return;

    setIsSaving(true);
    // 模拟云端上传延迟
    await new Promise(resolve => setTimeout(resolve, 800));

    if (modalMode === 'edit') {
      setStaffList(prev => prev.map(s => s.id === editingId ? { ...s, name: formData.name, phone: formData.phone } : s));
    } else {
      const newStaff = {
        id: 'staff_' + Date.now(),
        name: formData.name,
        role: UserRole.TEACHER,
        phone: formData.phone,
        entryDate: new Date().toISOString().split('T')[0]
      };
      setStaffList(prev => [newStaff, ...prev]);
    }

    setIsSaving(false);
    setIsModalOpen(false);
  };

  const filteredStaff = useMemo(() => {
    return staffList.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (s.phone && s.phone.includes(searchTerm))
    );
  }, [searchTerm, staffList]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">教职工管理</h2>
          <p className="text-sm text-gray-400">管理结果已自动云端同步 (本地存储持久化)</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-pink-100 w-64"
              placeholder="搜索姓名、手机号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleAdd}>
            <UserPlus size={18} className="mr-2" /> 新增人员
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="px-6 py-4">教职工姓名</th>
              <th className="px-6 py-4">职务/角色</th>
              <th className="px-6 py-4">联系方式</th>
              <th className="px-6 py-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredStaff.map((staff) => (
              <tr key={staff.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 font-bold text-xs">
                      {staff.name[0]}
                    </div>
                    <span className="font-bold text-gray-700">{staff.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge color={staff.role === UserRole.PRINCIPAL ? 'pink' : 'blue'}>
                    {staff.role === UserRole.PRINCIPAL ? '园长' : staff.className ? `${staff.className} 老师` : '教务主管'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-gray-500 font-medium text-sm">{staff.phone}</td>
                <td className="px-6 py-4 text-right space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-2 h-auto text-blue-400 hover:bg-blue-50"
                    onClick={() => handleEdit(staff)}
                  >
                    <Edit3 size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-2 h-auto text-red-400 hover:bg-red-50"
                    onClick={() => setDeleteConfirm(staff.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSaving && setIsModalOpen(false)} 
        title={modalMode === 'edit' ? "编辑教职工信息" : "新增教职工"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSaving}>取消</Button>
            <Button onClick={handleSave} loading={isSaving}>
              <Save size={16} className="mr-2" /> 确认并保存上传
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label="姓名" 
            name="name"
            placeholder="请输入教师姓名" 
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
          />
          <Input 
            label="手机号" 
            name="phone"
            placeholder="请输入11位手机号" 
            value={formData.phone}
            onChange={handleInputChange}
            error={errors.phone}
            hint="作为系统登录账号使用"
          />
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 ml-1">岗位职务</label>
            <select 
              name="position"
              className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-pink-200 focus:bg-white text-sm"
              value={formData.position}
              onChange={handleInputChange}
            >
              {Object.values(StaffPosition).map(pos => <option key={pos} value={pos}>{pos}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={!!deleteConfirm} 
        onClose={() => setDeleteConfirm(null)} 
        title="确认移除"
      >
        <div className="flex flex-col items-center py-6 text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-lg">确定要从系统中删除吗？</h4>
            <p className="text-sm text-gray-400 mt-1">此操作将同步更新到所有终端，且无法撤销。</p>
          </div>
          <div className="flex gap-3 w-full mt-4">
            <Button className="flex-1" variant="ghost" onClick={() => setDeleteConfirm(null)}>取消</Button>
            <Button className="flex-1" variant="danger" onClick={() => {
               setStaffList(prev => prev.filter(s => s.id !== deleteConfirm));
               setDeleteConfirm(null);
            }}>确认删除并同步</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StaffManagement;

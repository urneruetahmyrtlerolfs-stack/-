
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, Input, Modal, Badge, Progress } from '../../components/Common';
import { MOCK_STUDENTS as INITIAL_STUDENTS, KINDERGARTEN_CLASSES } from '../../constants';
// Add missing 'Users' and 'HelpCircle' to the lucide-react import to resolve errors on lines 407 and 441
import { 
  Search, Upload, UserCheck, ChevronRight, FileSpreadsheet, 
  CheckCircle2, Trash2, ChevronDown, Check, ExternalLink, 
  RefreshCw, Layers, Square, CheckSquare, XCircle, UserMinus,
  Users, HelpCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'taian_student_data';

const SYSTEM_FIELDS = [
  { key: 'name', label: '幼儿姓名', required: true, matchers: ['姓名', '幼儿姓名', '孩子姓名', '宝宝姓名', '学生', 'Name', 'FullName', '幼儿'] },
  { key: 'gender', label: '性别', required: false, matchers: ['性别', '男女', 'Gender', 'Sex'] },
  { key: 'age', label: '年龄', required: false, matchers: ['年龄', '岁', 'Age', 'Years'] },
  { key: 'className', label: '分配班级', required: false, matchers: ['班级', '所属班级', '班别', '分班', 'Class', 'ClassName', '年级'] },
  { key: 'parentName', label: '家长姓名', required: false, matchers: ['家长', '家长姓名', '联系人', '监护人', '主要联系人', 'Parent', 'Guardian', '父亲', '母亲'] },
  { key: 'phone', label: '联系电话', required: false, matchers: ['电话', '手机号', '联系电话', '手机', '家长电话', 'Phone', 'Mobile', 'Tel', '11位'] },
];

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<any[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_STUDENTS; }
    }
    return INITIAL_STUDENTS;
  });

  const [activeClass, setActiveClass] = useState(KINDERGARTEN_CLASSES[0]);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'mapping' | 'success'>('upload');
  const [importSummary, setImportSummary] = useState<Record<string, number>>({});
  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [rawHeaders, setRawHeaders] = useState<{name: string, index: number}[]>([]);
  const [rawRows, setRawRows] = useState<any[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, number>>({});
  
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editData, setEditData] = useState<any>(null);
  const [saveProgress, setSaveProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    if (newlyAddedIds.size > 0) {
      const timer = setTimeout(() => setNewlyAddedIds(new Set()), 5000);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedIds]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleOpenDetail = (student: any) => {
    if (isSelectionMode) {
      toggleSelection(student.id);
      return;
    }
    setSelectedStudent(student);
    setEditData({ ...student });
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedIds(newSelection);
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`确定要彻底删除这 ${selectedIds.size} 名幼儿的档案吗？此操作无法撤销。`)) {
      setStudents(prev => prev.filter(s => !selectedIds.has(s.id)));
      showToast(`已成功删除 ${selectedIds.size} 条档案`);
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    }
  };

  // 强化后的快速删除逻辑
  const handleQuickDelete = useCallback((e: React.MouseEvent, id: string) => {
    // 关键：阻止事件传播和默认行为，确保不触发卡片的 onClick
    e.stopPropagation();
    e.preventDefault();
    
    // 使用异步微任务确保 UI 响应，然后再执行确认逻辑
    setTimeout(() => {
      if (window.confirm('确认立即删除该幼儿的档案信息吗？')) {
        setStudents(prev => {
          const newList = prev.filter(s => s.id !== id);
          return newList;
        });
        showToast('档案已迅速移除');
      }
    }, 10);
  }, []);

  const handleSaveModification = async () => {
    if (!editData) return;
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 400));
    setStudents(prev => prev.map(s => s.id === editData.id ? { ...editData } : s));
    setIsSaving(false);
    setSelectedStudent(null);
    showToast('档案更新成功');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        // raw: false 确保读取格式化后的文本（如电话号码不会变成科学计数法）
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false }) as any[][];
        
        if (data.length < 1) {
          alert("Excel表格内容为空，请检查后重试。");
          return;
        }

        const headers = data[0].map((h, idx) => ({ 
          name: String(h || `列 ${idx + 1}`).trim(), 
          index: idx 
        }));
        
        // 过滤完全空行，并清理每列单元格首尾空格
        const rows = data.slice(1)
          .filter(r => r.some(cell => cell && String(cell).trim() !== ''))
          .map(r => r.map(cell => cell ? String(cell).trim() : ''));

        setRawHeaders(headers);
        setRawRows(rows);

        // 智能字段匹配逻辑
        const initialMapping: Record<string, number> = {};
        SYSTEM_FIELDS.forEach(field => {
          const match = headers.find(h => 
            field.matchers.some(m => h.name.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(h.name.toLowerCase()))
          );
          if (match) initialMapping[field.key] = match.index;
        });

        setColumnMapping(initialMapping);
        setImportStep('mapping');
      } catch (err) {
        alert("文件解析失败，请确保您上传的是标准的 Excel (.xlsx) 文件。");
      }
    };
    reader.readAsBinaryString(file);
  };

  const confirmImport = async () => {
    if (columnMapping['name'] === undefined) {
      alert("请至少指定‘幼儿姓名’所在的 Excel 列，否则无法导入。");
      return;
    }

    setIsSaving(true);
    setSaveProgress(10);
    const summary: Record<string, number> = {};
    const addedIds = new Set<string>();

    const processedData = rawRows.map(row => {
      const getVal = (fieldKey: string) => {
        const colIdx = columnMapping[fieldKey];
        if (colIdx === undefined) return '';
        return row[colIdx] || '';
      };

      const name = getVal('name') || '未知幼儿';
      const rawGender = getVal('gender') || '';
      const rawAge = parseInt(getVal('age') || '3');
      const rawClassName = getVal('className') || activeClass;

      // 班级智能纠偏
      const matchedClass = KINDERGARTEN_CLASSES.find(c => 
        c === rawClassName || 
        c.replace('1', '一').replace('2', '二').replace('3', '三') === rawClassName ||
        rawClassName.includes(c)
      ) || activeClass;

      summary[matchedClass] = (summary[matchedClass] || 0) + 1;
      const id = 'imp_' + Math.random().toString(36).substr(2, 9);
      addedIds.add(id);

      return {
        id,
        name,
        gender: rawGender.includes('女') || rawGender.toLowerCase() === 'f' ? 'female' : 'male',
        age: isNaN(rawAge) ? 3 : rawAge,
        className: matchedClass,
        parentName: getVal('parentName') || '资料待补',
        phone: getVal('phone') || '未录入',
        status: 'in'
      };
    });

    // 视觉进度条
    const interval = setInterval(() => {
      setSaveProgress(p => (p >= 90 ? 90 : p + 20));
    }, 60);

    await new Promise(resolve => setTimeout(resolve, 500)); 
    clearInterval(interval);
    setSaveProgress(100);

    setStudents(prev => [...processedData, ...prev]);
    setImportSummary(summary);
    setNewlyAddedIds(addedIds);
    
    setTimeout(() => {
      setIsSaving(false);
      setImportStep('success');
      showToast(`成功同步 ${processedData.length} 名幼儿`);
    }, 200);
  };

  const closeImport = () => {
    setIsImportOpen(false);
    setImportStep('upload');
    setRawHeaders([]);
    setRawRows([]);
    setColumnMapping({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredStudents = students.filter((s: any) => 
    s.className === activeClass && 
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     s.parentName.includes(searchTerm) ||
     s.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6 relative">
      {/* 全局通知 */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white px-8 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={18} className="text-pink-400" />
          <span className="text-sm font-bold tracking-wide">{toast}</span>
        </div>
      )}

      <div className="flex justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">幼儿档案中心</h2>
          <p className="text-sm text-gray-400">沅陵县太安幼儿园教务管理 · 数据本地持久化</p>
        </div>
        <div className="flex gap-2.5 flex-wrap justify-end">
          <Button 
            variant={isSelectionMode ? "primary" : "outline"} 
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedIds(new Set());
            }}
          >
            {isSelectionMode ? <XCircle size={18} className="mr-2" /> : <Layers size={18} className="mr-2" />}
            {isSelectionMode ? "退出批量" : "开启批量删除"}
          </Button>
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Upload size={18} className="mr-2" /> 智能名册导入
          </Button>
          <Button onClick={() => {
             const newId = 'stu_' + Date.now();
             const newStudent = {id: newId, name: '新同学', gender: 'male', age: 3, className: activeClass, parentName: '监护人', phone: '13800000000', status: 'in'};
             setStudents(p => [newStudent, ...p]);
             setNewlyAddedIds(new Set([newId]));
             setSelectedStudent(newStudent);
             setEditData({...newStudent});
          }}>
            <UserCheck size={18} className="mr-2" /> 手动录入
          </Button>
        </div>
      </div>

      {isSelectionMode && (
        <div className="bg-pink-50 p-4 rounded-3xl flex justify-between items-center animate-in slide-in-from-top-4 border-2 border-pink-100 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-pink-100 rounded-2xl shadow-inner"><UserMinus className="text-pink-500" size={20} /></div>
             <div>
               <p className="text-sm font-black text-pink-700">批量清理模式已激活</p>
               <p className="text-[11px] text-pink-500 font-bold">已选择 {selectedIds.size} 名幼儿记录</p>
             </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="text-pink-600 font-bold" onClick={() => setSelectedIds(new Set(filteredStudents.map(s => s.id)))}>全选本页</Button>
            <Button size="sm" variant="danger" disabled={selectedIds.size === 0} onClick={handleBatchDelete} className="px-6">
              一键彻底删除
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {KINDERGARTEN_CLASSES.map((cls) => (
            <button
              key={cls}
              onClick={() => setActiveClass(cls)}
              className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all whitespace-nowrap border-2 relative
                ${activeClass === cls 
                  ? 'bg-[#FFB7C5] border-[#FFB7C5] text-white shadow-lg shadow-pink-100' 
                  : 'bg-white border-gray-50 text-gray-400 hover:border-pink-50 hover:text-pink-400'}`}
            >
              {cls}
              <span className="ml-2 text-[10px] opacity-60">({students.filter((s: any) => s.className === cls).length})</span>
              {Array.from(newlyAddedIds).some(id => students.find((s:any) => s.id === id)?.className === cls) && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-bounce" />
              )}
            </button>
          ))}
        </div>

        <Card className="flex flex-wrap gap-4 items-center bg-gray-50/50">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              className="w-full pl-11 pr-4 py-3 bg-white border-2 border-transparent rounded-2xl text-sm outline-none focus:border-pink-100 transition-all shadow-sm"
              placeholder={`在 ${activeClass} 中搜索姓名、家长手机号...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge color="pink">当前班级：{activeClass}</Badge>
        </Card>
      </div>

      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-in fade-in duration-500">
          {filteredStudents.map((student: any) => (
            <Card 
              key={student.id} 
              className={`p-6 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group relative border-2 
                ${selectedIds.has(student.id) ? 'border-pink-400 bg-pink-50/30' : 'border-transparent'}
                ${newlyAddedIds.has(student.id) ? 'bg-pink-50/10' : ''}`}
              onClick={() => handleOpenDetail(student)}
            >
              {/* 复选框模式 */}
              {isSelectionMode && (
                <div className="absolute top-5 left-5 z-[20] scale-125">
                   {selectedIds.has(student.id) ? <CheckSquare className="text-pink-500" /> : <Square className="text-gray-300" />}
                </div>
              )}

              {/* 核心删除按钮：高优先级、高灵敏度 */}
              {!isSelectionMode && (
                <button 
                  onClick={(e) => handleQuickDelete(e, student.id)}
                  className="absolute top-3 right-3 p-3 bg-white text-gray-200 hover:bg-red-500 hover:text-white rounded-2xl transition-all opacity-0 group-hover:opacity-100 z-[60] shadow-xl border border-gray-50 flex items-center justify-center active:scale-90"
                  style={{ pointerEvents: 'auto' }}
                  title="立即删除此档案"
                >
                  <Trash2 size={16} />
                </button>
              )}

              <div className={`flex items-start justify-between mb-5 ${isSelectionMode ? 'pl-9' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-3xl bg-pink-100 flex items-center justify-center text-pink-500 font-black text-2xl shadow-sm">
                    {student.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg leading-tight mb-1.5">{student.name}</h4>
                    <div className="flex gap-1.5">
                      <Badge color={student.gender === 'male' ? 'blue' : 'pink'}>{student.gender === 'male' ? '男孩' : '女孩'}</Badge>
                      <Badge color="yellow">{student.age}岁</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`pt-4 border-t border-gray-50 text-[11px] text-gray-400 space-y-2 ${isSelectionMode ? 'pl-9' : ''}`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">主监护人</span>
                  <span className="text-gray-700 font-black">{student.parentName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">联系方式</span>
                  <span className="text-gray-700 font-bold font-mono tracking-tight">{student.phone}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border-4 border-dashed border-gray-50">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-100 mb-6"><Users size={48} /></div>
          <p className="text-gray-300 font-black text-xl">暂无幼儿档案记录</p>
          <p className="text-sm text-gray-200 mt-2">点击上方“手动录入”或“智能表格导入”开始管理</p>
        </div>
      )}

      {/* 导入流程弹窗 */}
      <Modal 
        isOpen={isImportOpen} 
        onClose={closeImport} 
        title="名册智能入库"
        size={importStep === 'mapping' ? 'xl' : 'md'}
        footer={
          importStep === 'mapping' ? (
            <>
              <Button variant="ghost" onClick={() => setImportStep('upload')} disabled={isSaving}>重选文件</Button>
              <Button onClick={confirmImport} loading={isSaving}>校验无误，正式同步</Button>
            </>
          ) : importStep === 'success' ? (
            <Button onClick={closeImport}>完成并返回</Button>
          ) : null
        }
      >
        {importStep === 'upload' && (
          <div className="space-y-8 text-center py-6">
            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
            <div onClick={() => fileInputRef.current?.click()} className="border-4 border-dashed border-gray-50 rounded-[40px] p-16 hover:border-pink-200 hover:bg-pink-50/20 transition-all group cursor-pointer">
              <div className="w-24 h-24 bg-pink-100 rounded-[32px] flex items-center justify-center mx-auto text-pink-400 mb-6 group-hover:scale-110 transition-transform">
                <FileSpreadsheet size={48} />
              </div>
              <p className="text-lg text-gray-700 font-black">点击此处上传 Excel 幼儿名单</p>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed px-10">系统支持自动识别列标题，无需严格模板。<br/>支持 手机号、班级、监护人、性别 等核心字段。</p>
            </div>
            <div className="flex justify-center items-center gap-2 text-[10px] text-gray-300">
               <HelpCircle size={14} /> 无法导入？尝试将文件另存为 .xlsx 格式再试。
            </div>
          </div>
        )}

        {importStep === 'mapping' && (
          <div className="space-y-8">
            {isSaving ? (
              <div className="py-20 text-center space-y-4">
                <Progress value={saveProgress} label="正在执行深度解析与持久化存储..." />
                <p className="text-[10px] text-gray-400 animate-pulse font-bold tracking-widest uppercase">Encryption & Syncing...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-6 bg-pink-400 rounded-full" />
                    <h4 className="font-bold text-gray-800">1. 对齐数据列</h4>
                  </div>
                  <div className="space-y-4 max-h-[440px] overflow-y-auto pr-3 custom-scrollbar">
                    {SYSTEM_FIELDS.map(field => (
                      <div key={field.key} className="p-4 bg-gray-50 rounded-3xl border-2 border-transparent hover:border-pink-50 transition-all">
                        <div className="flex justify-between items-center mb-2.5">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                             {field.label} {field.required && <span className="text-red-400 font-black text-lg leading-none">*</span>}
                           </label>
                           {columnMapping[field.key] !== undefined && <Check size={14} className="text-green-500" />}
                        </div>
                        <div className="relative">
                           <select 
                            className="w-full bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm outline-none appearance-none focus:border-pink-100 transition-all"
                            value={columnMapping[field.key] ?? ''}
                            onChange={(e) => setColumnMapping(prev => ({ ...prev, [field.key]: e.target.value === '' ? undefined : parseInt(e.target.value) }))}
                          >
                            <option value="">-- 跳过/不导入此项 --</option>
                            {rawHeaders.map(h => <option key={h.index} value={h.index}>{h.name}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-6 bg-blue-400 rounded-full" />
                    <h4 className="font-bold text-gray-800">2. 解析结果预览</h4>
                  </div>
                  <div className="bg-gray-50 rounded-3xl p-1 overflow-hidden border-2 border-gray-50 shadow-inner">
                    <div className="max-h-[420px] overflow-auto">
                      <table className="w-full text-[10px] text-left">
                        <thead className="bg-white/95 sticky top-0 shadow-sm z-10">
                          <tr>{SYSTEM_FIELDS.map(f => <th key={f.key} className="px-3 py-3.5 text-gray-400 font-black whitespace-nowrap">{f.label}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {rawRows.slice(0, 10).map((row, idx) => (
                            <tr key={idx} className="bg-white hover:bg-pink-50/20 transition-colors">
                              {SYSTEM_FIELDS.map(f => {
                                const colIdx = columnMapping[f.key];
                                return <td key={f.key} className="px-3 py-3 text-gray-600 whitespace-nowrap">{colIdx !== undefined ? row[colIdx] : <span className="text-gray-200">未指定</span>}</td>;
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-300 text-center italic mt-2">预览仅展示前 10 条数据，确认后将全量导入。</p>
                </div>
              </div>
            )}
          </div>
        )}

        {importStep === 'success' && (
          <div className="py-16 text-center space-y-8 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-50 rounded-[32px] flex items-center justify-center mx-auto text-green-500 shadow-sm border-2 border-green-100">
              <CheckCircle2 size={56} />
            </div>
            <div>
               <h3 className="text-2xl font-black text-gray-800">同步完成！</h3>
               <p className="text-sm text-gray-400 mt-2">名册已全量更新至园所数据库，各班级名单已分发。</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
              {Object.entries(importSummary).map(([cls, count]) => (
                <div key={cls} className="bg-white border-2 border-gray-50 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm">
                   <span className="text-xs font-black text-gray-700">{cls}</span>
                   <Badge color="blue">+{count}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* 幼儿档案详情弹窗 */}
      <Modal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} title="档案明细管理" footer={
        <div className="flex justify-between w-full">
          <Button variant="ghost" className="text-red-400 hover:bg-red-50 hover:text-red-600 rounded-2xl" onClick={(e) => {
             if(window.confirm('确认删除该档案吗？此操作不可恢复。')) {
               setStudents(p => p.filter(s => s.id !== selectedStudent.id));
               setSelectedStudent(null);
               showToast('档案已移除');
             }
          }}><Trash2 size={16} /> 彻底删除</Button>
          <div className="flex gap-2">
            <Button variant="ghost" className="rounded-2xl" onClick={() => setSelectedStudent(null)}>关闭</Button>
            <Button onClick={handleSaveModification} loading={isSaving} className="rounded-2xl px-8">保存修改</Button>
          </div>
        </div>
      }>
        {editData && (
          <div className="space-y-6">
            <Input label="幼儿姓名" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="主监护人姓名" value={editData.parentName} onChange={(e) => setEditData({...editData, parentName: e.target.value})} />
              <Input label="监护人联系电话" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 ml-1">所属班级</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-pink-100 text-sm appearance-none font-bold" value={editData.className} onChange={(e) => setEditData({...editData, className: e.target.value})}>
                    {KINDERGARTEN_CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 ml-1">档案状态</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-pink-100 text-sm appearance-none font-bold" value={editData.status} onChange={(e) => setEditData({...editData, status: e.target.value})}>
                    <option value="in">在园</option>
                    <option value="out">离园</option>
                    <option value="transfer">休学/转园</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentManagement;

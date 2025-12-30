
import React, { useState } from 'react';
import { Card, Button, Badge, Modal } from '../../components/Common';
import { MOCK_STUDENTS } from '../../constants';
import { Check, X, Camera, Smile, AlertCircle } from 'lucide-react';

const DailyManagement: React.FC = () => {
  const [attendance, setAttendance] = useState<Record<string, string>>(
    MOCK_STUDENTS.reduce((acc, s) => ({ ...acc, [s.id]: 'present' }), {})
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const toggleStatus = (id: string) => {
    setAttendance(prev => ({
      ...prev,
      [id]: prev[id] === 'present' ? 'absent' : 'present'
    }));
  };

  const handleStatusReport = (student: any) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">班级日常管理</h2>
          <p className="text-gray-500">当前班级：小一班 | 2023年10月27日</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => {
            const allPresent = Object.keys(attendance).reduce((acc, id) => ({ ...acc, [id]: 'present' }), {});
            setAttendance(allPresent);
          }}>一键全选</Button>
          <Button size="sm">确认提交出勤</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_STUDENTS.map(student => (
          <Card key={student.id} className="p-4 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-12 h-12 flex items-center justify-center transition-colors 
              ${attendance[student.id] === 'present' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {attendance[student.id] === 'present' ? <Check size={20} /> : <X size={20} />}
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 font-bold text-xl">
                {student.name[0]}
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{student.name}</h4>
                <p className="text-xs text-gray-500">{student.gender === 'male' ? '男' : '女'} · {student.age}岁</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant={attendance[student.id] === 'present' ? 'ghost' : 'danger'} 
                size="sm" 
                className="flex-1"
                onClick={() => toggleStatus(student.id)}
              >
                {attendance[student.id] === 'present' ? '标记缺勤' : '标记到园'}
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                className="flex-1"
                onClick={() => handleStatusReport(student)}
              >
                记动态
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">班级动态时光轴</h3>
        <div className="space-y-4">
          {[
            { time: '09:30', content: '集体晨练：孩子们在操场上跳健康操，非常活泼。', type: 'activity', images: [1, 2] },
            { time: '11:20', content: '午餐汇报：今日午餐是红烧排骨、西兰花，多数孩子表现良好。', type: 'food' },
          ].map((log, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-300" />
                <div className="w-0.5 flex-1 bg-gray-100 my-1" />
              </div>
              <div className="flex-1 pb-6">
                <span className="text-xs font-bold text-blue-400">{log.time}</span>
                <p className="text-gray-700 mt-1">{log.content}</p>
                {log.images && (
                  <div className="flex gap-2 mt-2">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      <Camera size={20} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`记录宝宝动态: ${selectedStudent?.name}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>取消</Button>
            <Button onClick={() => {
              setIsModalOpen(false);
              alert('记录已保存并推送到家长端');
            }}>发送给家长</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">今日表现</label>
            <div className="flex gap-3">
              <button className="flex-1 p-3 border rounded-xl hover:bg-pink-50 hover:border-pink-200 flex flex-col items-center gap-1 transition-colors">
                <Smile className="text-pink-400" />
                <span className="text-xs">很棒</span>
              </button>
              <button className="flex-1 p-3 border rounded-xl hover:bg-yellow-50 hover:border-yellow-200 flex flex-col items-center gap-1 transition-colors">
                <AlertCircle className="text-yellow-400" />
                <span className="text-xs">需关注</span>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">动态描述</label>
            <textarea 
              className="w-full border rounded-xl p-3 h-24 focus:ring-2 focus:ring-pink-200 outline-none text-sm"
              placeholder="输入宝宝今日在园的点滴..."
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">上传照片</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:border-pink-200 hover:text-pink-300 transition-colors cursor-pointer">
              <Camera size={32} />
              <span className="text-xs mt-2">点击或拖拽上传照片</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DailyManagement;

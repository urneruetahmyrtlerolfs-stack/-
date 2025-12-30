
import React from 'react';
import { 
  LayoutDashboard, Users, GraduationCap, School, CheckSquare, Settings, 
  FileText, Calendar, Library, PieChart, UserCheck, MessageSquare, 
  Heart, ClipboardCheck, BookOpen
} from 'lucide-react';
import { UserRole } from './types';

export const COLORS = {
  primary: '#FFB7C5',    // Soft Pink
  secondary: '#87CEEB',  // Soft Blue
  accent: '#98FB98',     // Pale Green
  warning: '#FFD700',    // Gold/Yellow
  background: '#FFFDF9', // Creamy White
  text: '#4A4A4A',
};

export const KINDERGARTEN_CLASSES = [
  '小1班', '小2班', '小3班',
  '中1班', '中2班',
  '大1班', '大2班', '大3班'
];

export const NAVIGATION_ITEMS = {
  [UserRole.PRINCIPAL]: [
    { label: '数据概览', path: 'dashboard', icon: <LayoutDashboard size={20} /> },
    { label: '教职工管理', path: 'staff', icon: <Users size={20} /> },
    { label: '幼儿管理', path: 'students', icon: <GraduationCap size={20} /> },
    { label: '班级管理', path: 'classes', icon: <School size={20} /> },
    { label: '教务审核', path: 'audit', icon: <CheckSquare size={20} /> },
    { label: '系统设置', path: 'settings', icon: <Settings size={20} /> },
  ],
  [UserRole.ACADEMIC]: [
    { label: '教学计划', path: 'plans', icon: <FileText size={20} /> },
    { label: '活动管理', path: 'activities', icon: <Calendar size={20} /> },
    { label: '课程资源', path: 'resources', icon: <Library size={20} /> },
    { label: '教务统计', path: 'stats', icon: <PieChart size={20} /> },
    { label: '学籍管理', path: 'registry', icon: <UserCheck size={20} /> },
  ],
  [UserRole.TEACHER]: [
    { label: '日常管理', path: 'daily', icon: <ClipboardCheck size={20} /> },
    { label: '计划提交', path: 'submit-plan', icon: <FileText size={20} /> },
    { label: '家园沟通', path: 'chat', icon: <MessageSquare size={20} /> },
    { label: '班级事务', path: 'class-affairs', icon: <Heart size={20} /> },
    { label: '资源库', path: 'resource-lib', icon: <BookOpen size={20} /> },
  ],
  [UserRole.PARENT]: [
    { label: '宝宝动态', path: 'child-status', icon: <Heart size={20} /> },
    { label: '通知公告', path: 'notifications', icon: <MessageSquare size={20} /> },
    { label: '家园互动', path: 'interaction', icon: <Users size={20} /> },
    { label: '个人中心', path: 'profile', icon: <Settings size={20} /> },
  ],
};

export const MOCK_STUDENTS = [
  { id: '1', name: '李晓萌', gender: 'female', age: 3, className: '小1班', parentName: '李建国', phone: '13812345678', status: 'in' },
  { id: '2', name: '王小美', gender: 'female', age: 3, className: '小1班', parentName: '王大壮', phone: '13811112222', status: 'in' },
  { id: '3', name: '张小帅', gender: 'male', age: 4, className: '中1班', parentName: '张丽华', phone: '13987654321', status: 'in' },
  { id: '4', name: '王朵朵', gender: 'female', age: 3, className: '小2班', parentName: '王大锤', phone: '13700001111', status: 'in' },
  { id: '5', name: '赵子轩', gender: 'male', age: 5, className: '大1班', parentName: '赵铁柱', phone: '13622223333', status: 'in' },
  { id: '6', name: '孙悟空', gender: 'male', age: 5, className: '大2班', parentName: '孙大胜', phone: '13544445555', status: 'in' },
  { id: '7', name: '周小鱼', gender: 'female', age: 4, className: '中2班', parentName: '周大海', phone: '13100002222', status: 'in' },
  { id: '8', name: '陈果果', gender: 'female', age: 3, className: '小3班', parentName: '陈皮', phone: '13399998888', status: 'in' },
  { id: '9', name: '林木木', gender: 'male', age: 5, className: '大3班', parentName: '林深', phone: '13022221111', status: 'in' },
];

export const MOCK_STAFF = [
  { id: '101', name: '刘园长', role: UserRole.PRINCIPAL, phone: '13566667777' },
  { id: '102', name: '陈主任', role: UserRole.ACADEMIC, phone: '13144445555' },
  { id: '103', name: '林老师', role: UserRole.TEACHER, className: '小1班', phone: '13388889999' },
];

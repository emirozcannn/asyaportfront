import React, { useEffect, useState } from 'react';
import { Card, Typography, List, Button, Tag, Modal, Form, Input, Select, message } from 'antd';
import { useAuthStore } from '../../stores/authStore';
import type { User } from '../../types';
// TODO: Departman kullanıcılarını getiren bir servis eklenmeli

const { Title, Text } = Typography;

const DepartmentAdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      employeeNumber: 'AP100',
      firstName: 'Furkan',
      lastName: 'Yılmaz',
      email: 'furkan@asyaport.com',
      departmentId: user?.departmentId || '',
      role: 'Employee',
      isActive: true,
      createdAt: '',
      departmentName: user?.departmentName,
      fullName: 'Furkan Yılmaz',
    },
    {
      id: '2',
      employeeNumber: 'AP101',
      firstName: 'Ayşe',
      lastName: 'Demir',
      email: 'ayse@asyaport.com',
      departmentId: user?.departmentId || '',
      role: 'ZimmetManager',
      isActive: false,
      createdAt: '',
      departmentName: user?.departmentName,
      fullName: 'Ayşe Demir',
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // TODO: Departman kullanıcılarını API'den çek
  // useEffect ile API'den veri çekme yerine mock data kullanılıyor

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Card style={{ marginBottom: 24 }}>
        <Title level={3}>{user?.departmentName} Departmanı Admin Paneli</Title>
        <Text strong>Admin:</Text> <Tag color="purple">{user?.fullName || user?.firstName}</Tag>
        <br />
        <Button type="primary" onClick={() => setIsModalOpen(true)} style={{ marginTop: 16 }}>Kullanıcı Ekle</Button>
      </Card>

      <Card title="Departman Kullanıcıları" style={{ marginBottom: 24 }}>
        <List
          loading={loading}
          dataSource={users}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={item.fullName || (item.firstName + ' ' + item.lastName)}
                description={`Email: ${item.email} | Rol: ${item.role}`}
              />
              <Tag color={item.isActive ? 'green' : 'red'}>{item.isActive ? 'Aktif' : 'Pasif'}</Tag>
            </List.Item>
          )}
          locale={{ emptyText: 'Departmanda kullanıcı yok.' }}
        />
      </Card>

      <Modal
        title="Kullanıcı Ekle"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        {/* Kullanıcı ekleme formu buraya gelecek */}
        <Form layout="vertical" onFinish={values => {
          setUsers(prev => [
            ...prev,
            {
              id: (prev.length + 1).toString(),
              employeeNumber: 'AP' + (100 + prev.length + 1),
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              departmentId: user?.departmentId || '',
              role: values.role,
              isActive: true,
              createdAt: '',
              departmentName: user?.departmentName,
              fullName: values.firstName + ' ' + values.lastName,
            }
          ]);
          setIsModalOpen(false);
        }}>
          <Form.Item label="Ad" name="firstName" required>
            <Input />
          </Form.Item>
          <Form.Item label="Soyad" name="lastName" required>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" required>
            <Input type="email" />
          </Form.Item>
          <Form.Item label="Rol" name="role" required>
            <Select options={[{ value: 'Employee', label: 'Kullanıcı' }, { value: 'ZimmetManager', label: 'Zimmet Yöneticisi' }]} />
          </Form.Item>
          <Button type="primary" htmlType="submit">Kaydet</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default DepartmentAdminDashboard;

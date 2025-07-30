
import React from 'react';
import { Card, Typography, List, Tag } from 'antd';
import { useAuthStore } from '../../stores/authStore';
import { useAssignments } from '../../hooks/useAssignments';

const { Title, Text } = Typography;

const UserDashboard: React.FC = () => {

  const { user } = useAuthStore();
  const { assignments, loading, error } = useAssignments();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card style={{ marginBottom: 24 }}>
        <Title level={3}>Hoş geldiniz, {user?.fullName || user?.firstName}!</Title>
        <Text strong>Departman:</Text> <Tag color="blue">{user?.departmentName}</Tag>
        <br />
        <Text strong>Rol:</Text> <Tag color="purple">{user?.role}</Tag>
      </Card>


      <Card title="Aktif Zimmetleriniz" style={{ marginBottom: 24 }}>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <List
          loading={loading}
          dataSource={assignments}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={item.assetName}
                description={`Zimmet No: ${item.assignmentNumber} | Durum: ${item.status}`}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button disabled style={{ cursor: 'not-allowed', opacity: 0.6 }}>Raporla</button>
                <button disabled style={{ cursor: 'not-allowed', opacity: 0.6 }}>Yazdır</button>
              </div>
            </List.Item>
          )}
          locale={{ emptyText: 'Aktif zimmetiniz yok.' }}
        />
      </Card>

      {/* Sadece görüntüleme ve raporlama/yazdırma işlemleri için butonlar eklenmiştir. */}
    </div>
  );
};

export default UserDashboard;

import { useEffect, useState, useCallback } from 'react';
import { Row, Col, Card, Statistic, Typography, Alert, Spin, Button } from 'antd';
import { 
  ToolOutlined, 
  FileTextOutlined, 
  UserOutlined, 
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { assetService, assignmentService } from '../../services/assets';
import { Assignment } from '../../types';

const { Title, Text } = Typography;

interface DashboardStats {
  totalAssets: number;
  availableAssets: number;
  assignedAssets: number;
  myAssignments: number;
  overdueAssignments: number;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    availableAssets: 0,
    assignedAssets: 0,
    myAssignments: 0,
    overdueAssignments: 0
  });
  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Assets bilgilerini al
      const assetsResponse = await assetService.getAssets();
      if (assetsResponse.success && assetsResponse.data) {
        const assets = assetsResponse.data;
        const availableCount = assets.filter(a => a.status === 'Available').length;
        const assignedCount = assets.filter(a => a.status === 'Assigned').length;

        // Zimmet bilgilerini al
        let myAssignmentsCount = 0;
        let recentList: Assignment[] = [];

        if (user?.role === 'Admin' || user?.role === 'ZimmetManager') {
          // Admin/Manager için tüm aktif zimmetleri al
          const assignmentsResponse = await assignmentService.getActiveAssignments();
          if (assignmentsResponse.success && assignmentsResponse.data) {
            recentList = assignmentsResponse.data.slice(0, 5); // Son 5 zimmet
            myAssignmentsCount = assignmentsResponse.data.length;
          }
        } else {
          // Normal kullanıcı için kendi zimmetlerini al
          const myAssignmentsResponse = await assignmentService.getMyAssignments();
          if (myAssignmentsResponse.success && myAssignmentsResponse.data) {
            recentList = myAssignmentsResponse.data.slice(0, 5);
            myAssignmentsCount = myAssignmentsResponse.data.filter(a => a.status === 'Active').length;
          }
        }

        setStats({
          totalAssets: assets.length,
          availableAssets: availableCount,
          assignedAssets: assignedCount,
          myAssignments: myAssignmentsCount,
          overdueAssignments: 0 // Bu hesaplaması backend'de yapılacak
        });

        setRecentAssignments(recentList);
      }
    } catch (err) {
      setError('Dashboard verileri yüklenirken hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="loading-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Hata"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={loadDashboardData}>
            Tekrar Dene
          </Button>
        }
      />
    );
  }

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Hoş geldiniz, {user?.firstName}! 👋
        </Title>
        <Text type="secondary">
          {user?.departmentName} - {user?.role === 'Admin' ? 'Sistem Yöneticisi' : 
           user?.role === 'ZimmetManager' ? 'Zimmet Sorumlusu' : 'Çalışan'}
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Varlık"
              value={stats.totalAssets}
              prefix={<ToolOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Müsait Varlık"
              value={stats.availableAssets}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Zimmetli Varlık"
              value={stats.assignedAssets}
              prefix={<FileTextOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={user?.role === 'Employee' ? "Zimmetlerim" : "Aktif Zimmet"}
              value={stats.myAssignments}
              prefix={<UserOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Hızlı İşlemler" size="small">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button 
                type="primary" 
                icon={<ToolOutlined />}
                onClick={() => navigate('/assets')}
              >
                Varlıkları Görüntüle
              </Button>
              
              <Button 
                icon={<FileTextOutlined />}
                onClick={() => navigate('/assignments')}
              >
                Zimmetleri Görüntüle
              </Button>

              {(user?.role === 'Admin' || user?.role === 'ZimmetManager') && (
                <Button 
                  type="dashed"
                  onClick={() => navigate('/assets')}
                >
                  Yeni Varlık Ekle
                </Button>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Son Aktiviteler" size="small">
            {recentAssignments.length > 0 ? (
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {recentAssignments.map((assignment) => (
                  <div 
                    key={assignment.id} 
                    style={{ 
                      padding: '8px 0', 
                      borderBottom: '1px solid #f0f0f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <Text strong>{assignment.assetName}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {assignment.assignedToName} - {assignment.assignmentNumber}
                      </Text>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: 10, 
                        color: assignment.status === 'Active' ? '#52c41a' : '#faad14',
                        fontWeight: 'bold'
                      }}>
                        {assignment.status === 'Active' ? 'AKTİF' : 'İADE EDİLDİ'}
                      </div>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {new Date(assignment.assignmentDate).toLocaleDateString('tr-TR')}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Text type="secondary">Henüz zimmet hareketi yok</Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* Info Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card size="small">
            <div style={{ textAlign: 'center', padding: 16 }}>
              <ClockCircleOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
              <Title level={4}>Zimmet Sistemi</Title>
              <Text type="secondary">
                QR kod ile hızlı zimmet verme ve alma işlemleri gerçekleştirebilirsiniz.
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card size="small">
            <div style={{ textAlign: 'center', padding: 16 }}>
              <ExclamationCircleOutlined style={{ fontSize: 24, color: '#faad14', marginBottom: 8 }} />
              <Title level={4}>Dikkat</Title>
              <Text type="secondary">
                Zimmet aldığınız varlıkları zamanında iade etmeyi unutmayınız.
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
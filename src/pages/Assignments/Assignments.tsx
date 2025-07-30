import { useEffect, useState, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Card, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Select, 
  message,
  Tabs,
  Typography,
  Popconfirm
} from 'antd';
import { 
  FileTextOutlined, 
  PlusOutlined, 
  QrcodeOutlined,
  RetweetOutlined,
  ReloadOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '../../stores/authStore';
import { assignmentService, assetService } from '../../services/assets';
import type { Assignment, Asset, User } from '../../types';
import { QRScanner } from '../../components/QRScanner/QRScanner';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;
const { TabPane } = Tabs;

interface AssignAssetForm {
  assetId: string;
  assignedToId: string;
  notes?: string;
}

export const Assignments: React.FC = () => {
  const { user } = useAuthStore();
  const [activeAssignments, setActiveAssignments] = useState<Assignment[]>([]);
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  
  // Modal states
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [isQRScannerVisible, setIsQRScannerVisible] = useState(false);
  const [assignForm] = Form.useForm();
  const [assignLoading, setAssignLoading] = useState(false);
  
  // Data for assign modal
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const isManagerOrAdmin = user?.role === 'Admin' || user?.role === 'ZimmetManager';

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      
      if (isManagerOrAdmin) {
        // Admin/Manager için tüm aktif zimmetler
        const activeResponse = await assignmentService.getActiveAssignments();
        if (activeResponse.success && activeResponse.data) {
          setActiveAssignments(activeResponse.data);
        }
      }
      
      // Kendi zimmetlerini al
      const myResponse = await assignmentService.getMyAssignments();
      if (myResponse.success && myResponse.data) {
        setMyAssignments(myResponse.data);
      }
    } catch {
      message.error('Zimmetler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [isManagerOrAdmin]);

  const loadAvailableAssets = useCallback(async () => {
    try {
      const response = await assetService.getAssets();
      if (response.success && response.data) {
        const available = response.data.filter(asset => asset.status === 'Available');
        setAvailableAssets(available);
      }
    } catch {
      message.error('Varlıklar yüklenemedi');
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      // Bu endpoint'i backend'de oluşturmamız gerekiyor
      // Şimdilik mock data kullanalım
      setUsers([
        { 
          id: 'user1', 
          employeeNumber: 'EMP001', 
          firstName: 'Test', 
          lastName: 'Employee',
          email: 'employee@asyaport.com',
          role: 'Employee',
          fullName: 'Test Employee',
          departmentName: 'Operasyon'
        }
      ]);
    } catch {
      message.error('Kullanıcılar yüklenemedi');
    }
  }, []);

  useEffect(() => {
    loadAssignments();
    if (isManagerOrAdmin) {
      loadUsers();
    }
  }, [loadAssignments, isManagerOrAdmin, loadUsers]);

  const handleAssignAsset = async (values: AssignAssetForm) => {
    try {
      setAssignLoading(true);
      const response = await assignmentService.assignAsset({
        assetId: values.assetId,
        assignedToId: values.assignedToId,
        notes: values.notes
      });
      
      if (response.success) {
        message.success('Varlık başarıyla zimmetlendi');
        setIsAssignModalVisible(false);
        assignForm.resetFields();
        setSelectedAsset(null);
        loadAssignments();
      } else {
        message.error(response.error || 'Zimmetleme başarısız');
      }
    } catch {
      message.error('Zimmetleme sırasında hata oluştu');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleReturnAsset = async (assignmentId: string) => {
    try {
      const response = await assignmentService.returnAsset(assignmentId);
      
      if (response.success) {
        message.success('Varlık başarıyla iade edildi');
        loadAssignments();
      } else {
        message.error(response.error || 'İade işlemi başarısız');
      }
    } catch {
      message.error('İade işlemi sırasında hata oluştu');
    }
  };

  const handleQRScan = async (qrCode: string) => {
    try {
      const response = await assetService.getAssetByQrCode(qrCode);
      
      if (response.success && response.data) {
        const asset = response.data;
        
        if (asset.status === 'Available') {
          // Zimmetleme için modal aç
          setSelectedAsset(asset);
          assignForm.setFieldsValue({ assetId: asset.id });
          setIsQRScannerVisible(false);
          setIsAssignModalVisible(true);
          loadAvailableAssets();
        } else {
          message.info(`Bu varlık şu anda ${asset.assignedToName} kişisinde zimmetli`);
        }
      } else {
        message.error('QR kod okunamadı veya varlık bulunamadı');
      }
    } catch {
      message.error('QR kod işlemi sırasında hata oluştu');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'green';
      case 'Returned':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active':
        return 'Aktif';
      case 'Returned':
        return 'İade Edildi';
      default:
        return status;
    }
  };

  const activeColumns: ColumnsType<Assignment> = [
    {
      title: 'Zimmet No',
      dataIndex: 'assignmentNumber',
      key: 'assignmentNumber',
      width: 120,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Varlık',
      key: 'asset',
      render: (record) => (
        <div>
          <Text strong>{record.assetName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.assetNumber}
          </Text>
        </div>
      )
    },
    {
      title: 'Zimmetli Kişi',
      dataIndex: 'assignedToName',
      key: 'assignedToName',
      render: (text) => (
        <Text><UserOutlined style={{ marginRight: 4 }} />{text}</Text>
      )
    },
    {
      title: 'Zimmet Tarihi',
      dataIndex: 'assignmentDate',
      key: 'assignmentDate',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString('tr-TR')
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    ...(isManagerOrAdmin ? [{
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      render: (record: Assignment) => (
        <Space>
          <Popconfirm
            title="Bu varlığı iade etmek istediğinizden emin misiniz?"
            onConfirm={() => handleReturnAsset(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button 
              size="small" 
              type="primary" 
              ghost
              icon={<RetweetOutlined />}
            >
              İade
            </Button>
          </Popconfirm>
        </Space>
      )
    }] : [])
  ];

  const myColumns: ColumnsType<Assignment> = [
    {
      title: 'Zimmet No',
      dataIndex: 'assignmentNumber',
      key: 'assignmentNumber',
      width: 120,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Varlık',
      key: 'asset',
      render: (record) => (
        <div>
          <Text strong>{record.assetName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.assetNumber}
          </Text>
        </div>
      )
    },
    {
      title: 'Zimmet Tarihi',
      dataIndex: 'assignmentDate',
      key: 'assignmentDate',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString('tr-TR')
    },
    {
      title: 'İade Tarihi',
      dataIndex: 'returnDate',
      key: 'returnDate',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('tr-TR') : '-'
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Notlar',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (text) => text || '-'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileTextOutlined />
            Zimmet Yönetimi
          </h2>
        </div>
        
        <Space>
          <Button 
            icon={<ReloadOutlined />}
            onClick={loadAssignments}
            loading={loading}
          >
            Yenile
          </Button>
          
          {isManagerOrAdmin && (
            <>
              <Button 
                icon={<QrcodeOutlined />}
                onClick={() => setIsQRScannerVisible(true)}
              >
                QR Kod Oku
              </Button>
              
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setIsAssignModalVisible(true);
                  loadAvailableAssets();
                }}
              >
                Zimmet Ver
              </Button>
            </>
          )}
        </Space>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs defaultActiveKey="my">
          <TabPane tab={`Zimmetlerim (${myAssignments.length})`} key="my">
            <Table
              columns={myColumns}
              dataSource={myAssignments}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} / ${total} zimmet`
              }}
            />
          </TabPane>
          
          {isManagerOrAdmin && (
            <TabPane tab={`Tüm Aktif Zimmetler (${activeAssignments.length})`} key="active">
              <div style={{ marginBottom: 16 }}>
                <Search
                  placeholder="Zimmet no, varlık veya kişi adı ile ara..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                  allowClear
                />
              </div>
              
              <Table
                columns={activeColumns}
                dataSource={activeAssignments.filter(assignment =>
                  !searchText || 
                  assignment.assignmentNumber.toLowerCase().includes(searchText.toLowerCase()) ||
                  assignment.assetName.toLowerCase().includes(searchText.toLowerCase()) ||
                  assignment.assignedToName.toLowerCase().includes(searchText.toLowerCase())
                )}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} / ${total} zimmet`
                }}
              />
            </TabPane>
          )}
        </Tabs>
      </Card>

      {/* Assign Asset Modal */}
      <Modal
        title="Varlık Zimmetleme"
        open={isAssignModalVisible}
        onCancel={() => {
          setIsAssignModalVisible(false);
          assignForm.resetFields();
          setSelectedAsset(null);
        }}
        footer={null}
        width={600}
      >
        {selectedAsset && (
          <div style={{ 
            padding: 12, 
            background: '#f5f5f5', 
            marginBottom: 16, 
            borderRadius: 6 
          }}>
            <Text strong>Seçilen Varlık: </Text>
            <Text>{selectedAsset.name} ({selectedAsset.assetNumber})</Text>
          </div>
        )}
        
        <Form
          form={assignForm}
          layout="vertical"
          onFinish={handleAssignAsset}
        >
          <Form.Item
            name="assetId"
            label="Varlık"
            rules={[{ required: true, message: 'Varlık seçin!' }]}
          >
            <Select 
              placeholder="Varlık seçin"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {availableAssets.map(asset => (
                <Option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.assetNumber})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="assignedToId"
            label="Zimmet Verilecek Kişi"
            rules={[{ required: true, message: 'Kişi seçin!' }]}
          >
            <Select placeholder="Kişi seçin">
              {users.map(u => (
                <Option key={u.id} value={u.id}>
                  {u.fullName} ({u.employeeNumber})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Notlar">
            <Input.TextArea rows={3} placeholder="İsteğe bağlı notlar..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsAssignModalVisible(false)}>
                İptal
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={assignLoading}
              >
                Zimmetle
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* QR Scanner Modal */}
      <QRScanner
        visible={isQRScannerVisible}
        onClose={() => setIsQRScannerVisible(false)}
        onScan={handleQRScan}
      />
    </div>
  );
};
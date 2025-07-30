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
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  QrcodeOutlined,
  ToolOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '../../stores/authStore';
import { assetService } from '../../services/assets';
import { Asset, AssetCategory } from '../../types';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

interface CreateAssetForm {
  name: string;
  serialNumber?: string;
  categoryId: string;
}

export const Assets: React.FC = () => {
  const { user } = useAuthStore();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  // Modal states
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [createLoading, setCreateLoading] = useState(false);

  const loadAssets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await assetService.getAssets();
      if (response.success && response.data) {
        setAssets(response.data);
      } else {
        message.error(response.error || 'Varlıklar yüklenemedi');
      }
    } catch {
      message.error('Varlıklar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await assetService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch {
      console.error('Kategoriler yüklenemedi');
    }
  }, []);

  const filterAssets = useCallback(() => {
    let filtered = [...assets];

    // Arama filtresi
    if (searchText) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchText.toLowerCase()) ||
        asset.assetNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Kategori filtresi
    if (selectedCategory) {
      filtered = filtered.filter(asset => asset.categoryName === selectedCategory);
    }

    // Durum filtresi
    if (selectedStatus) {
      filtered = filtered.filter(asset => asset.status === selectedStatus);
    }

    setFilteredAssets(filtered);
  }, [assets, searchText, selectedCategory, selectedStatus]);

  useEffect(() => {
    loadAssets();
    loadCategories();
  }, [loadAssets, loadCategories]);

  useEffect(() => {
    filterAssets();
  }, [filterAssets]);

  const handleCreateAsset = async (values: CreateAssetForm) => {
    try {
      setCreateLoading(true);
      const response = await assetService.createAsset(values);
      
      if (response.success) {
        message.success('Varlık başarıyla oluşturuldu');
        setIsCreateModalVisible(false);
        createForm.resetFields();
        loadAssets();
      } else {
        message.error(response.error || 'Varlık oluşturulamadı');
      }
    } catch {
      message.error('Varlık oluşturulurken hata oluştu');
    } finally {
      setCreateLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'green';
      case 'Assigned':
        return 'orange';
      case 'Damaged':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Available':
        return 'Müsait';
      case 'Assigned':
        return 'Zimmetli';
      case 'Damaged':
        return 'Hasarlı';
      default:
        return status;
    }
  };

  const columns: ColumnsType<Asset> = [
    {
      title: 'Varlık No',
      dataIndex: 'assetNumber',
      key: 'assetNumber',
      width: 120,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Varlık Adı',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true
    },
    {
      title: 'Seri No',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 120,
      render: (text) => text ? <Text code>{text}</Text> : '-'
    },
    {
      title: 'Kategori',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 120
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
      title: 'Zimmetli Kişi',
      key: 'assignedTo',
      width: 150,
      render: (record) => (
        record.assignedToName ? (
          <div>
            <Text strong>{record.assignedToName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.assignedToEmployee}
            </Text>
          </div>
        ) : (
          <Text type="secondary">-</Text>
        )
      )
    },
    {
      title: 'QR Kod',
      key: 'qrCode',
      width: 80,
      render: (record) => (
        <Button 
          size="small" 
          icon={<QrcodeOutlined />}
          onClick={() => {
            Modal.info({
              title: 'QR Kod',
              content: <Text code>{record.qrCode}</Text>,
              width: 300
            });
          }}
        />
      )
    }
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ToolOutlined />
            Varlık Yönetimi
          </h2>
          <Text type="secondary">Toplam {filteredAssets.length} varlık</Text>
        </div>
        
        <Space>
          <Button 
            icon={<ReloadOutlined />}
            onClick={loadAssets}
            loading={loading}
          >
            Yenile
          </Button>
          
          {(user?.role === 'Admin' || user?.role === 'ZimmetManager') && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
            >
              Yeni Varlık
            </Button>
          )}
        </Space>
      </div>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="Varlık adı, numarası veya seri no ile ara..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          
          <Select
            placeholder="Kategori seç"
            value={selectedCategory}
            onChange={setSelectedCategory}
            style={{ width: 150 }}
            allowClear
          >
            {categories.map(cat => (
              <Option key={cat.id} value={cat.name}>{cat.name}</Option>
            ))}
          </Select>
          
          <Select
            placeholder="Durum seç"
            value={selectedStatus}
            onChange={setSelectedStatus}
            style={{ width: 120 }}
            allowClear
          >
            <Option value="Available">Müsait</Option>
            <Option value="Assigned">Zimmetli</Option>
            <Option value="Damaged">Hasarlı</Option>
          </Select>
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredAssets}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} / ${total} varlık`
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Create Asset Modal */}
      <Modal
        title="Yeni Varlık Oluştur"
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateAsset}
        >
          <Form.Item
            name="name"
            label="Varlık Adı"
            rules={[{ required: true, message: 'Varlık adını girin!' }]}
          >
            <Input placeholder="Örn: Dell Laptop XPS 13" />
          </Form.Item>

          <Form.Item
            name="serialNumber"
            label="Seri Numarası"
          >
            <Input placeholder="Örn: DL123456789" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Kategori"
            rules={[{ required: true, message: 'Kategori seçin!' }]}
          >
            <Select placeholder="Kategori seçin">
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsCreateModalVisible(false)}>
                İptal
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={createLoading}
              >
                Oluştur
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
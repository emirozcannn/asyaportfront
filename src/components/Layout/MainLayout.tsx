import { Layout, Menu, Button, Avatar, Dropdown, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, DashboardOutlined, FileTextOutlined, ToolOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}


export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  // Yetki kontrol fonksiyonu: HR ise tüm menüler, diğerleri departmanına göre
  const getMenuItems = () => {
    if (!user) return [];
    const isHR = user.departmentName === 'İnsan Kaynakları' || user.departmentId === 'HR';
    const isAdmin = user.role === 'Admin';
    const isZimmetManager = user.role === 'ZimmetManager';

    // Herkes dashboard görebilir
    const items = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        onClick: () => navigate('/dashboard')
      }
    ];

    // HR veya admin/zimmet yöneticisi ise varlık ve zimmet menüleri
    if (isHR || isAdmin || isZimmetManager) {
      items.push({
        key: '/assets',
        icon: <ToolOutlined />,
        label: 'Varlıklar',
        onClick: () => navigate('/assets')
      });
      items.push({
        key: '/assignments',
        icon: <FileTextOutlined />,
        label: 'Zimmetler',
        onClick: () => navigate('/assignments')
      });
    }

    // Diğer departmanlar için ek menü kuralları burada eklenebilir
    // Örneğin, sadece belirli kategorilere erişim vs.

    return items;
  };

  const menuItems = getMenuItems();

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış',
      onClick: () => {
        logout();
        navigate('/login');
      }
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={200}>
        <div style={{ 
          padding: '16px', 
          color: 'white', 
          textAlign: 'center',
          borderBottom: '1px solid #303030'
        }}>
          <h3 style={{ color: 'white', margin: 0 }}>ZimmetTakip</h3>
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ marginTop: 16 }}
        />
      </Sider>

      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div>
            <Text strong style={{ fontSize: 16 }}>
              {location.pathname === '/dashboard' && 'Dashboard'}
              {location.pathname === '/assets' && 'Varlık Yönetimi'}
              {location.pathname === '/assignments' && 'Zimmet Yönetimi'}
            </Text>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Text>{user?.departmentName}</Text>
            <Dropdown 
              menu={{ items: userMenuItems }}
              placement="bottomRight"
            >
              <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <span>{user?.fullName}</span>
              </Button>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ 
          margin: '24px',
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          minHeight: 'calc(100vh - 112px)'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
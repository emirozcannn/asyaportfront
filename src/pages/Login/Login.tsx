import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [error, setError] = useState<string>('');

  const onFinish = async (values: { email: string; password: string }) => {
    setError('');
    
    const result = await login(values.email, values.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Giriş başarısız');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card 
        style={{ 
          width: 400, 
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#1890ff', margin: 0 }}>
            ZimmetTakip
          </Title>
          <Text type="secondary">Asyaport Liman İşletmesi</Text>
        </div>

        {error && (
          <Alert 
            message={error} 
            type="error" 
            showIcon 
            style={{ marginBottom: 16 }}
          />
        )}

        <Spin spinning={isLoading}>
          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label="E-posta"
              rules={[
                { required: true, message: 'E-posta adresinizi girin!' },
                { type: 'email', message: 'Geçerli bir e-posta adresi girin!' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="e-posta@asyaport.com"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Şifre"
              rules={[{ required: true, message: 'Şifrenizi girin!' }]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Şifre"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                style={{ width: '100%', height: 45 }}
                loading={isLoading}
              >
                Giriş Yap
              </Button>
            </Form.Item>
          </Form>
        </Spin>

        <div style={{ 
          marginTop: 24, 
          padding: 16, 
          background: '#f5f5f5', 
          borderRadius: 8,
          fontSize: 12
        }}>
          <Text strong>Test Hesapları:</Text><br />
          <Text code>admin@asyaport.com / Admin123!</Text><br />
          <Text code>employee@asyaport.com / Employee123!</Text>
        </div>
      </Card>
    </div>
  );
};
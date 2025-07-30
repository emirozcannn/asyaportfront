import { useEffect, useRef, useState, useCallback } from 'react';
import { Modal, Button, Alert } from 'antd';
import { CameraOutlined, StopOutlined } from '@ant-design/icons';
import { Html5QrcodeScanner } from 'html5-qrcode';



interface QRScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ visible, onClose, onScan }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');

  const startScanner = useCallback(() => {
    if (scannerRef.current) {
      stopScanner();
    }

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      disableFlip: false,
    };

    try {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        config,
        false
      );

      scannerRef.current.render(
        (decodedText: string) => {
          onScan(decodedText);
          stopScanner();
          onClose();
        },
        (errorMessage: string) => {
          if (!errorMessage.includes('NotFoundException')) {
            console.warn('QR scan error:', errorMessage);
          }
        }
      );

      setIsScanning(true);
      setError('');
    } catch (err) {
      setError('Kamera erişimi başarısız. Tarayıcınızın kamera iznini kontrol edin.');
      console.error('Scanner start error:', err);
    }
  }, [onScan, onClose]);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.warn('Scanner stop error:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (visible) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [visible, startScanner, stopScanner]);

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CameraOutlined />
          QR Kod Okuyucu
        </div>
      }
      open={visible}
      onCancel={handleClose}
      width={600}
      footer={[
        <Button key="stop" icon={<StopOutlined />} onClick={handleClose}>
          Kapat
        </Button>
      ]}
      destroyOnClose
    >
      <div style={{ textAlign: 'center' }}>
        {error && (
          <Alert
            message="Kamera Hatası"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            action={
              <Button size="small" onClick={startScanner}>
                Tekrar Dene
              </Button>
            }
          />
        )}

        <div 
          id="qr-reader" 
          style={{ 
            width: '100%',
            minHeight: isScanning ? '400px' : '200px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        />
      </div>
    </Modal>
  );
};
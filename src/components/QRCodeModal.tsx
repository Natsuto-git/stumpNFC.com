import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  qrCodeValue: string;
  couponTitle: string;
}

export const QRCodeModal = ({ open, onClose, qrCodeValue, couponTitle }: QRCodeModalProps) => {
  // QRコード値が空の場合は何も表示しない
  if (!qrCodeValue) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">クーポンQRコード</DialogTitle>
          <DialogDescription className="text-center pt-2">
            {couponTitle}のQRコードを店舗スタッフに提示してください
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG
                  value={qrCodeValue}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              QRコードID: {qrCodeValue.substring(0, 8)}...
            </p>
          </div>

          <div className="text-sm text-gray-500 text-center">
            <p>このQRコードを店舗スタッフにスキャンしてもらってください</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={onClose} className="flex-1 bg-orange-600 hover:bg-orange-700">
            閉じる
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};


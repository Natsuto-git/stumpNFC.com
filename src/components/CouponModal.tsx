import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Coupon } from '@/lib/types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface CouponModalProps {
  coupon: Coupon;
  open: boolean;
  onClose: () => void;
  onUse: () => void;
}

export const CouponModal = ({ coupon, open, onClose, onUse }: CouponModalProps) => {
  const handleUse = () => {
    // クーポンを使用済みにマーク（QRコードの生成と表示は親コンポーネントで処理）
    onUse();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">🎉 クーポン獲得！</DialogTitle>
            <DialogDescription className="text-center pt-2">
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-6 text-center">
              {coupon.title === 'ドリンク1杯無料' ? (
                <div className="mb-4">
                  <img 
                    src={encodeURI("/ドリンク１杯無料.png")} 
                    alt="ドリンク1杯無料クーポン" 
                    className="w-full max-w-xs mx-auto rounded-lg"
                  />
                </div>
              ) : coupon.title === '次回10%OFF' ? (
                <div className="mb-4">
                  <img 
                    src={encodeURI("/10%クーポン.png")} 
                    alt="10%オフクーポン" 
                    className="w-full max-w-xs mx-auto rounded-lg"
                  />
                </div>
              ) : (
                <div className="text-4xl font-bold text-orange-600 mb-2">{coupon.discount}</div>
              )}
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{coupon.title}</h3>
              <p className="text-sm text-gray-600">{coupon.description}</p>
            </div>

            <div className="text-sm text-gray-500 text-center">
              <p>有効期限: {format(coupon.expiresAt, 'yyyy年MM月dd日', { locale: ja })}</p>
              {coupon.isUsed && (
                <p className="text-orange-600 font-medium mt-2">✓ 使用済み</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            {!coupon.isUsed && (
              <Button onClick={handleUse} className="flex-1 bg-orange-600 hover:bg-orange-700">
                クーポンを使用
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="flex-1">
              {coupon.isUsed ? '閉じる' : 'あとで'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};


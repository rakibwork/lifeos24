import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
}

const NoDataDialog = ({ open, onOpenChange, date }: Props) => {
  const formattedDate = new Date(date).toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm text-center">
        <DialogHeader>
          <div className="text-5xl mb-3">📭</div>
          <DialogTitle className="text-lg font-black">কোনো তথ্য নেই</DialogTitle>
          <DialogDescription className="text-sm">
            দুঃখিত! {formattedDate} তারিখের কোনো তথ্য সংরক্ষিত নেই। আজকের তারিখে ফিরে গিয়ে আপনার কার্যক্রম রেকর্ড করুন।
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default NoDataDialog;

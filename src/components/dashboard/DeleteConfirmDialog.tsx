import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

const DeleteConfirmDialog = ({ open, onOpenChange, onConfirm, title = "ডিলেট করতে চান?", description = "এটি মুছে ফেলা হবে এবং পুনরুদ্ধার করা যাবে না।" }: Props) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-black">⚠️ {title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl font-bold">না, রাখুন</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90">হ্যাঁ, ডিলেট করুন</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmDialog;

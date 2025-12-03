import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddItemHeaderProps {
  title: string;
  buttonText: string;
  onButtonClick: () => void;
}

const AddItemHeader = ({ title, buttonText, onButtonClick }: AddItemHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <Button variant="outline" size="sm" onClick={onButtonClick}>
        <Plus className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
    </div>
  );
};

export default AddItemHeader;

import { ReactNode } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface MobileBuilderSheetProps {
  children: ReactNode;
  title?: string;
  side?: 'left' | 'right';
  trigger?: ReactNode;
}

export function MobileBuilderSheet({ 
  children, 
  title = "Components",
  side = 'left',
  trigger
}: MobileBuilderSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon" className="lg:hidden h-9 w-9">
            <Menu className="h-4 w-4" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side={side} className="w-[85vw] max-w-[320px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-base">{title}</SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100vh-60px)] overflow-auto">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { ReactNode } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SlidersHorizontal } from 'lucide-react';

interface MobileParametersDrawerProps {
  children: ReactNode;
  title?: string;
}

export function MobileParametersDrawer({ children, title = "Parameters" }: MobileParametersDrawerProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden h-9 w-9">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-base">{title}</DrawerTitle>
        </DrawerHeader>
        <ScrollArea className="px-4 pb-6 max-h-[70vh]">
          {children}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}

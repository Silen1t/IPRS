

import { Separator } from '@/shadcn-ui/components/ui/separator';
import { SidebarTrigger } from '@/shadcn-ui/components/ui/sidebar';
import useHeaderTitle from '@/contexts/HeaderTitleContext'; 

export function SiteHeader() {
  const { title } = useHeaderTitle(); 

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ms-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        
        {/*  Display the responsive page title */}
        <span className="text-sm font-semibold tracking-tight text-foreground transition-all duration-200">
          {title}
        </span>
      </div>
    </header>
  );
}
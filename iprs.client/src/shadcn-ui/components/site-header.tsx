import { useLocation } from 'react-router';
import { Separator } from '@/shadcn-ui/components/ui/separator';
import { SidebarTrigger } from '@/shadcn-ui/components/ui/sidebar';

const ROUTE_TITLE_OVERRIDES: Record<string, string> = {
  '': 'Dashboard',
  requests: 'Requests',
};

export function SiteHeader() {
  const location = useLocation();

  const getDynamicTitle = (pathname: string) => {
    const cleanPath = pathname.replace(/^\/|\/$/g, '');

    if (ROUTE_TITLE_OVERRIDES[cleanPath] !== undefined) {
      return ROUTE_TITLE_OVERRIDES[cleanPath];
    }

    return cleanPath
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ms-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium tracking-tight text-foreground">
          {getDynamicTitle(location.pathname)}
        </h1>
      </div>
    </header>
  );
}

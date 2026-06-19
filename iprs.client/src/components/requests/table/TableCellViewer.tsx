import { z } from 'zod';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { useIsMobile } from '@/shadcn-ui/hooks/use-mobile';
import { Button } from '@/shadcn-ui/components/ui/button';
import { Input } from '@/shadcn-ui/components/ui/input';
import { Label } from '@/shadcn-ui/components/ui/label';
import { Separator } from '@/shadcn-ui/components/ui/separator';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shadcn-ui/components/ui/chart';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shadcn-ui/components/ui/drawer';
import { purchaseRequestResponseSchema } from '@/schemas/purchaseRequest';

const chartData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: { label: 'Desktop', color: 'var(--primary)' },
  mobile: { label: 'Mobile', color: 'var(--primary)' },
} satisfies ChartConfig;

interface TableCellViewerProps {
  item: z.infer<typeof purchaseRequestResponseSchema>;
}

export function TableCellViewer({ item }: TableCellViewerProps) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="w-fit px-0 text-start text-primary hover:underline font-mono font-semibold"
        >
          {item.requestNumber ||
            `PR-${item.id.toString().slice(0, 5).toUpperCase()}`}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.title}</DrawerTitle>
          <DrawerDescription>
            Detailed Request View Information
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart data={chartData} margin={{ left: 0, right: 10 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="header">Request Description Title</Label>
              <Input id="header" defaultValue={item.title} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Current Status</Label>
                <Input
                  id="status"
                  value={item.status}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="price">Value (SAR)</Label>
                <Label htmlFor="price">
                </Label>
                <Input id="price" defaultValue={item.totalPrice} />
              </div>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button>Save System Parameter Modifications</Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

import dayjs from "dayjs";


export function FormatDate(date: string): string {
  return dayjs(date).format('MMM D, YYYY h:mm A');
}

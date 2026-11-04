import { Experience } from "@/app/components/Experience";
import { LocaleProvider } from "@/app/lib/i18n/LocaleProvider";

export default function Home() {
  return (
    <LocaleProvider>
      <Experience />
    </LocaleProvider>
  );
}

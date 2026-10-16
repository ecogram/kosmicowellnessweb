import { Faq } from '../features/home/Faq';
import { FinalCta } from '../features/home/FinalCta';

export function FaqPage() {
  return (
    <div className="flex flex-col w-full pt-20">
      <Faq />
      <FinalCta />
    </div>
  );
}

import { CallToActionSection } from '../components/home/CallToActionSection';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { EditorialSection } from '../components/home/EditorialSection';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { HeroSection } from '../components/home/HeroSection';
import { PageFrame } from '../components/ui/PageFrame';

export function HomePage() {
  return (
    <PageFrame title="Legacy Vault" visuallyHiddenTitle fullWidth>
      <HeroSection />
      <CategoryGrid />
      <FeaturedProducts />
      <EditorialSection />
      <CallToActionSection />
    </PageFrame>
  );
}

import { CallToActionSection } from '../components/home/CallToActionSection';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { EditorialSection } from '../components/home/EditorialSection';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { HeroSection } from '../components/home/HeroSection';
import { RecentProductsSection } from '../components/products/RecentProductsSection';
import { PageFrame } from '../components/ui/PageFrame';

export function HomePage() {
  return (
    <PageFrame title="Legacy Vault" visuallyHiddenTitle fullWidth>
      <HeroSection />
      <CategoryGrid />
      <FeaturedProducts />
      <RecentProductsSection className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" />
      <EditorialSection />
      <CallToActionSection />
    </PageFrame>
  );
}

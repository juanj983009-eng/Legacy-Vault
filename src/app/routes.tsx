import { Route, Routes } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout';
import { ProductsProvider } from '../context/ProductsProvider';
import { CartProvider } from '../context/CartProvider';
import { DemoAccessProvider } from '../context/DemoAccessProvider';
import { AboutPage } from '../pages/AboutPage';
import { CartPage } from '../pages/CartPage';
import { CatalogPage } from '../pages/CatalogPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CollectionsPage } from '../pages/CollectionsPage';
import { ContactPage } from '../pages/ContactPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProductPage } from '../pages/ProductPage';
import { RegisterPage } from '../pages/RegisterPage';
import { PATHS } from './paths';

export function AppRoutes() {
  return (
    <DemoAccessProvider>
      <ProductsProvider>
        <CartProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path={PATHS.home} element={<HomePage />} />
              <Route path={PATHS.catalog} element={<CatalogPage />} />
              <Route path={PATHS.collections} element={<CollectionsPage />} />
              <Route path={PATHS.product} element={<ProductPage />} />
              <Route path={PATHS.cart} element={<CartPage />} />
              <Route path={PATHS.checkout} element={<CheckoutPage />} />
              <Route path={PATHS.login} element={<LoginPage />} />
              <Route path={PATHS.register} element={<RegisterPage />} />
              <Route path={PATHS.about} element={<AboutPage />} />
              <Route path={PATHS.contact} element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </CartProvider>
      </ProductsProvider>
    </DemoAccessProvider>
  );
}

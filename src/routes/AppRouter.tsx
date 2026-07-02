/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Loader } from '../components/common/Loader'
import { MainLayout } from '../components/layout/MainLayout'
import { AdminLayout } from '../components/layout/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'

const HomePage = lazy(() => import('../pages/HomePage'))
const ProductsPage = lazy(() => import('../pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'))
const CartPage = lazy(() => import('../pages/CartPage'))
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const RegisterPage = lazy(() => import('../pages/RegisterPage'))
const AuthCallbackPage = lazy(() => import('../pages/AuthCallbackPage'))
const ProfilePage = lazy(() => import('../pages/ProfilePage'))
const OrdersPage = lazy(() => import('../pages/OrdersPage'))
const OrderSuccessPage = lazy(() => import('../pages/OrderSuccessPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'))

const lazyElement = (node: ReactNode) => {
  return <Suspense fallback={<Loader />}>{node}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: lazyElement(<HomePage />),
      },
      {
        path: 'products',
        element: lazyElement(<ProductsPage />),
      },
      {
        path: 'products/:id',
        element: lazyElement(<ProductDetailPage />),
      },
      {
        path: 'cart',
        element: lazyElement(<CartPage />),
      },
      {
        path: 'checkout',
        element: lazyElement(
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>,
        ),
      },
      {
        path: 'login',
        element: lazyElement(<LoginPage />),
      },
      {
        path: 'register',
        element: lazyElement(<RegisterPage />),
      },
      {
        path: 'auth/callback',
        element: lazyElement(<AuthCallbackPage />),
      },
      {
        path: 'profile',
        element: lazyElement(
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>,
        ),
      },
      {
        path: 'orders',
        element: lazyElement(
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>,
        ),
      },
      {
        path: 'order-success',
        element: lazyElement(<OrderSuccessPage />),
      },
      {
        path: 'admin',
        element: lazyElement(
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>,
        ),
        children: [
          {
            index: true,
            element: lazyElement(<AdminDashboardPage />),
          },
        ],
      },
      {
        path: '*',
        element: lazyElement(<NotFoundPage />),
      },
    ],
  },
])

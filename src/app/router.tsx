import { Outlet, createBrowserRouter } from 'react-router-dom';
import { Header } from '../components/Header';
import { HomePage } from '../pages/HomePage';
import { PodcastDetailPage } from '../pages/PodcastDetailPage';

function RootLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'podcast/:podcastId',
        element: <PodcastDetailPage />,
      },
    ],
  },
]);

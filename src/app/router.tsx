import { Outlet, createBrowserRouter } from 'react-router-dom';
import styled from 'styled-components';
import { Header } from '../components/Header';
import { EpisodeDetailPage, episodeDetailLoader } from '../pages/EpisodeDetailPage';
import { HomePage } from '../pages/HomePage';
import { PodcastDetailPage, podcastDetailLoader } from '../pages/PodcastDetailPage';

const Main = styled.main`
  min-height: calc(100vh - 4rem);
  background: #f7f7f7;
`;

function RootLayout() {
  return (
    <>
      <Header />
      <Main>
        <Outlet />
      </Main>
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
        loader: podcastDetailLoader,
      },
      {
        path: 'podcast/:podcastId/episode/:episodeId',
        element: <EpisodeDetailPage />,
        loader: episodeDetailLoader,
      },
    ],
  },
]);

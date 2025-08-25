import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Routes from './Routes/Routes.jsx';
import Authprovider from './AuthProvider/Authprovider.jsx';

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Authprovider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={Routes} />
      </QueryClientProvider>
    </Authprovider>
  </StrictMode>,
)

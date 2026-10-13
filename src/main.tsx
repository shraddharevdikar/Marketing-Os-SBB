import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupApiFetchInterceptor } from './lib/apiClient';

// Initialize global API fetch interceptor for Bearer token and tenant headers
setupApiFetchInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

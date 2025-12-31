import { createRoot } from 'react-dom/client';
import AppContainer from '@/App';
import '@/index.scss';

const root = document.getElementById('root');

if (!root) {
  throw new Error('element root not found');
}

const container = createRoot(root);

container.render(<AppContainer />);

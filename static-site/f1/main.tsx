import { createRoot } from 'react-dom/client';
import Workspace from '../../app/workspace';
import { publicUrl } from '../../lib/public-url';
import '../../app/globals.css';

createRoot(document.getElementById('root')!).render(
  <>
    <nav aria-label="返回主站" style={{ padding: '10px 24px', background: '#eef5f7' }}>
      <a href={publicUrl('/')}>← 返回综合医院多层研究</a>
    </nav>
    <Workspace />
  </>,
);

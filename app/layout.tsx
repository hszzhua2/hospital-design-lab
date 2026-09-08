import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title:'综合医院 · 多层设计研究', description:'结合公开真实医院项目的多层图纸、功能组织与跨层流程，开展可追溯的设计论证。', icons:{icon:'/favicon.svg'} };
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="zh-CN"><body>{children}</body></html>}

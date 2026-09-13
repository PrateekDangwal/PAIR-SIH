import { Navigation } from '@/components/landing/navigation';
import { Footer } from '@/components/landing/footer';
export default function PublicLayout({children}:{children:React.ReactNode}) {
  return <div className="min-h-screen chassis noise"><Navigation/><main className="pt-20">{children}</main><Footer/></div>;
}

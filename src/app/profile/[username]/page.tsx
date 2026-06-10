import { notFound } from 'next/navigation';
import PublicUserPage26 from '@/pages_fsd/user-page/PublicUserPage26';

export default async function ProfilePage({ params }: any) {
  const { username } = await Promise.resolve(params);

  if (!username) {
    notFound();
  }

  return <PublicUserPage26 username={username} />;
}

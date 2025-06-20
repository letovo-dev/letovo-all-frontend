import { notFound } from 'next/navigation';
import ClientAchievementPage from './ClientAchievementPage';

interface Props {
  params: {
    id: string;
    username: string;
  };
}

export default async function AchievementPage({ params }: any) {
  const { id, username } = await Promise.resolve(params);

  if (!id || !username) {
    notFound();
  }

  return <ClientAchievementPage id={id} username={username} />;
}

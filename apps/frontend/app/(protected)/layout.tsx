import Layout from "@/components/Layout/Layout";
import { getPinterestBoards, getUser } from "@/lib/dal";
import { AuthProvider } from "@/providers/AuthProvider";
import StoreProvider from "@/providers/StoreProvider";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const boards = await getPinterestBoards();
  const user = await getUser();

  const preloadedState = {
    pinterest: {
      boards,
      loading: false,
      error: null,
    },
    auth: { user },
  };

  return (
    <StoreProvider preloadedState={preloadedState}>
      <AuthProvider>
        <Layout>{children}</Layout>
      </AuthProvider>
    </StoreProvider>
  );
}

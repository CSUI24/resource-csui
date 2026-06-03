import { SearchSkeleton } from "@/components/shared/LoadingSkeletons";

export default function SearchLoading() {
  return (
    <main className="p-6">
      <SearchSkeleton />
    </main>
  );
}

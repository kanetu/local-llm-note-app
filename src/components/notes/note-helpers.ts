export function getRankColor(rank: number): string {
  if (rank === 1) {
    return "bg-amber-100 text-amber-900 border-amber-200";
  }

  if (rank === 2) {
    return "bg-sky-100 text-sky-900 border-sky-200";
  }

  return "bg-violet-100 text-violet-900 border-violet-200";
}

import { notFound } from "next/navigation";
import { HockeyGame } from "../_components/hockey-game";
import { getGameBySlug } from "@/app/_utils/games.catalog";

const game = getGameBySlug("hockey");

export const metadata = {
  title: game?.title,
  description: game?.description,
  alternates: { canonical: "/juegos/hockey" },
};

export default function HockeyGamePage() {
  if (!game) notFound();
  return <HockeyGame game={game} />;
}

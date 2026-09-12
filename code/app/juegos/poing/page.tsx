import { notFound } from "next/navigation";
import { PoingGame } from "../_components/poing-game";
import { getGameBySlug } from "@/app/_utils/games.catalog";

const game = getGameBySlug("poing");

export const metadata = {
  title: game?.title,
  description: game?.description,
  alternates: { canonical: "/juegos/poing" },
};

export default function PoingGamePage() {
  if (!game) notFound();
  return <PoingGame game={game} />;
}

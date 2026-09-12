import { notFound } from "next/navigation";
import { BloquesGame } from "../_components/bloques-game";
import { getGameBySlug } from "@/app/_utils/games.catalog";

const game = getGameBySlug("bloques");

export const metadata = {
  title: game?.title,
  description: game?.description,
  alternates: { canonical: "/juegos/bloques" },
};

export default function BloquesGamePage() {
  if (!game) notFound();
  return <BloquesGame game={game} />;
}

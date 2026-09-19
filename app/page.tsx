"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

export default function HomePage() {
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedName = getCookie("playerName");
    setPlayerName(savedName);
    setIsLoading(false);
  }, []);

  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setCookie("playerName", nameInput.trim());
      setPlayerName(nameInput.trim());
    }
  };

  if (isLoading) {
    return null;
  }

  if (!playerName) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmitName}
          className="flex flex-col items-center gap-4 w-full max-w-xs"
        >
          <Label className="text-2xl font-bold">Wat is je naam?</Label>
          <Input
            type="text"
            placeholder="Naam"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="text-center text-xl h-14"
            autoFocus
          />
          <Button
            type="submit"
            className="text-xl h-12 px-8 w-full"
            disabled={!nameInput.trim()}
          >
            Start
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <Label className="text-xl text-muted-foreground mb-2">
          Hallo, {playerName}!
        </Label>

        <Label className="text-lg text-muted-foreground mt-2">+ Optellen</Label>
        <div className="grid grid-cols-4 gap-2">
          <Button asChild className="text-lg h-12">
            <Link href="/exercise?type=addition-10">0-10</Link>
          </Button>
          <Button asChild className="text-lg h-12">
            <Link href="/exercise?type=addition-20">0-20</Link>
          </Button>
          <Button asChild className="text-lg h-12">
            <Link href="/exercise?type=addition-100-easy">0-100</Link>
          </Button>
          <Button asChild className="text-lg h-12">
            <Link href="/exercise?type=addition-100">0-100★</Link>
          </Button>
        </div>

        <Label className="text-lg text-muted-foreground mt-4">
          − Aftrekken
        </Label>
        <div className="grid grid-cols-4 gap-2">
          <Button asChild className="text-lg h-12">
            <Link href="/exercise?type=subtraction-10">0-10</Link>
          </Button>
          <Button asChild className="text-lg h-12">
            <Link href="/exercise?type=subtraction-20">0-20</Link>
          </Button>
          <Button asChild className="text-lg h-12">
            <Link href="/exercise?type=subtraction-100-easy">0-100</Link>
          </Button>
          <Button asChild className="text-lg h-12">
            <Link href="/exercise?type=subtraction-100">0-100★</Link>
          </Button>
        </div>

        <Label className="text-lg text-muted-foreground mt-4">
          Splitsingen
        </Label>
        <div className="grid grid-cols-4 gap-2">
          <Button asChild className="text-lg h-12">
            <Link href="/exercise?type=splitting">1-10</Link>
          </Button>
        </div>

        <Label className="text-lg text-muted-foreground mt-4">
          Maal tafels
        </Label>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <Button key={n} asChild className="text-lg h-12 w-12">
              <Link href={`/exercise?type=multiplication-${n}`}>{n}</Link>
            </Button>
          ))}
        </div>

        <Label className="text-lg text-muted-foreground mt-4">
          Deel tafels
        </Label>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <Button key={n} asChild className="text-lg h-12 w-12">
              <Link href={`/exercise?type=division-${n}`}>{n}</Link>
            </Button>
          ))}
        </div>
        <Button asChild variant="outline" className="text-lg h-10 px-6 mt-4">
          <Link href="/results">Resultaten</Link>
        </Button>
      </div>
    </div>
  );
}

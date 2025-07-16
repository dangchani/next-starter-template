'use client'

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            William DEV 개발 버전 - next.js
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6">
            cloudflare, Supabase, Firebase, lobCI/CD 테스트
          </p>
          <Link
            href="/board"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium"
          >
            게시판 바로가기
          </Link>
        </div>
      </main>
    </div>
  );
}

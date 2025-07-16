'use client'

import dynamic from 'next/dynamic'

const BoardList = dynamic(() => import('@/components/BoardList'), {
  ssr: false,
  loading: () => <div className="text-center py-8">로딩 중...</div>
})

export default function BoardPage() {
  return <BoardList />
} 
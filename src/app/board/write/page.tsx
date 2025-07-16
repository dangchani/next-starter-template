'use client'

import dynamic from 'next/dynamic'

const BoardForm = dynamic(() => import('@/components/BoardForm'), {
  ssr: false,
  loading: () => <div className="text-center py-8">로딩 중...</div>
})

export default function WritePage() {
  return <BoardForm />
} 
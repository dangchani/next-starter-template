'use client'

'use client'

import dynamic from 'next/dynamic'
import { use } from 'react'

const BoardDetail = dynamic(() => import('@/components/BoardDetail'), {
  ssr: false,
  loading: () => <div className="text-center py-8">로딩 중...</div>
})

interface BoardDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function BoardDetailPage({ params }: BoardDetailPageProps) {
  const { id } = use(params)
  return <BoardDetail postId={parseInt(id)} />
} 
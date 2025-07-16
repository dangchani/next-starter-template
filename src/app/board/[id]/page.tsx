'use client'

import dynamic from 'next/dynamic'

const BoardDetail = dynamic(() => import('@/components/BoardDetail'), {
  ssr: false,
  loading: () => <div className="text-center py-8">로딩 중...</div>
})

interface BoardDetailPageProps {
  params: {
    id: string
  }
}

export default function BoardDetailPage({ params }: BoardDetailPageProps) {
  return <BoardDetail postId={parseInt(params.id)} />
} 
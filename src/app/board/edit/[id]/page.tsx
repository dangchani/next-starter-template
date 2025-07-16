'use client'

import dynamic from 'next/dynamic'

const BoardForm = dynamic(() => import('@/components/BoardForm'), {
  ssr: false,
  loading: () => <div className="text-center py-8">로딩 중...</div>
})

interface BoardEditPageProps {
  params: {
    id: string
  }
}

export default function BoardEditPage({ params }: BoardEditPageProps) {
  return <BoardForm postId={parseInt(params.id)} isEdit={true} />
} 